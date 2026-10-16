#!/usr/bin/env python3
"""
=============================================================================
RFID Hardware Reader Emulator (RC522 / PN532 Simulator)
Academic Lab Course: Advanced Full-Stack IoT System
=============================================================================
Simulates physical 13.56 MHz RFID card taps transmitting data to the 
Spring Boot REST backend (Expt 1, Expt 6).

Capabilities:
1. Automated continuous streaming mode (taps simulated student cards every N seconds)
2. Interactive manual terminal input mode (allows typing arbitrary RFID tag IDs)
3. Stress testing & concurrency idempotency verification
4. CLI flag support:
   --auto               Start continuous auto-streaming immediately
   --interval <sec>     Stream tap interval (default: 3 seconds)
   --tag <tagId>        Fire a single RFID tap and exit immediately
   --url <backendUrl>   Custom backend URL (default: http://localhost:8080)
=============================================================================
"""

import sys
import time
import argparse
import random
from datetime import datetime

try:
    import requests
except ImportError:
    print("[ERROR] 'requests' module not found. Please install it using: pip install requests")
    sys.exit(1)

# ANSI Color Codes for terminal formatting
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

# Default sample cards representing registered and unregistered badges
SAMPLE_STUDENT_TAGS = [
    ("TAG-A101", "Aarav Sharma", "CS2024-001"),
    ("TAG-B202", "Diya Patel", "CS2024-002"),
    ("TAG-C303", "Rohan Verma", "IT2024-015"),
    ("TAG-D404", "Ananya Iyer", "EC2024-042"),
    ("TAG-E505", "Kabir Mehta", "ME2024-088"),
]

INVALID_TAGS = [
    ("UNKNOWN-999", "Unregistered Intruder Badge"),
    ("INVALID-HEX", "Malformed Card Tap"),
]

DEFAULT_BACKEND_URL = "http://localhost:8080"


def print_banner(backend_url):
    print(f"{Colors.CYAN}{Colors.BOLD}")
    print("=" * 72)
    print("   UNIVERSITY SMART LAB &bull; 13.56MHz RFID HARDWARE SENSOR EMULATOR   ")
    print("   Simulating RC522 / PN532 Physical Tag Scan Transmissions           ")
    print("=" * 72)
    print(f"{Colors.END}")
    print(f"Target Backend API: {Colors.UNDERLINE}{backend_url}{Colors.END}")
    print(f"Timestamp:          {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 72)


def check_backend_health(base_url):
    """Verify backend connectivity before running tests."""
    try:
        res = requests.get(f"{base_url}/api/attendance/stats", timeout=3)
        if res.status_code == 200:
            stats = res.json()
            print(f"{Colors.GREEN}[ONLINE]{Colors.END} Backend connected successfully.")
            print(f"         Total Enrolled: {stats.get('totalEnrolled', 0)} | "
                  f"Present Today: {stats.get('totalPresentToday', 0)} | "
                  f"Attendance Rate: {stats.get('attendancePercentage', 0)}%\n")
            return True
        else:
            print(f"{Colors.YELLOW}[WARNING]{Colors.END} Backend returned status {res.status_code}")
            return True
    except requests.exceptions.RequestException:
        print(f"{Colors.RED}[OFFLINE]{Colors.END} Could not connect to backend at {base_url}")
        print(f"          Please ensure the Spring Boot application is running on port 8080.\n")
        return False


def transmit_rfid_tap(tag_id, base_url, student_hint=None, role="HOD", dept="ALL"):
    """
    Transmit an RFID tap event to POST /api/attendance/scan.
    Handles HTTP 201 (Success), 403 (Department Forbidden), 409 (Duplicate), 404 (Unregistered), and Errors.
    """
    scan_endpoint = f"{base_url}/api/attendance/scan"
    payload = {
        "rfidTagId": tag_id.strip(),
        "facultyRole": role,
        "facultyDepartment": dept
    }
    headers = {
        "X-Faculty-Role": role,
        "X-Faculty-Department": dept
    }
    timestamp_str = datetime.now().strftime("%H:%M:%S")

    hint_str = f" ({student_hint})" if student_hint else ""
    print(f"[{timestamp_str}] [RFID TAP] Transmitting Tag: {Colors.BOLD}{tag_id}{Colors.END}{hint_str} [Role: {role}] ...", end=" ", flush=True)

    try:
        start_time = time.time()
        res = requests.post(scan_endpoint, json=payload, headers=headers, timeout=5)
        elapsed_ms = int((time.time() - start_time) * 1000)

        if res.status_code == 201:
            data = res.json()
            student = data.get("student", {})
            status = data.get("status", "PRESENT")
            status_color = Colors.GREEN if status == "PRESENT" else Colors.YELLOW
            print(f"{status_color}[SUCCESS 201]{Colors.END} {student.get('name')} ({student.get('rollNo')}) -> Status: {Colors.BOLD}{status}{Colors.END} ({elapsed_ms}ms)")
            return True, "SUCCESS"

        elif res.status_code == 403:
            data = res.json() if res.content else {}
            msg = data.get("message", "Access Denied: Faculty not authorized for this branch student")
            print(f"{Colors.RED}[ACCESS DENIED 403]{Colors.END} {msg} ({elapsed_ms}ms)")
            return False, "FORBIDDEN"

        elif res.status_code == 409:
            data = res.json() if res.content else {}
            msg = data.get("message", "Duplicate scan rejected: Already marked today")
            print(f"{Colors.YELLOW}[DUPLICATE 409]{Colors.END} {msg} ({elapsed_ms}ms)")
            return False, "DUPLICATE"

        elif res.status_code == 404:
            data = res.json() if res.content else {}
            msg = data.get("message", "Unregistered RFID card tag")
            print(f"{Colors.RED}[ACCESS DENIED 404]{Colors.END} {msg} ({elapsed_ms}ms)")
            return False, "NOT_FOUND"

        else:
            print(f"{Colors.RED}[HTTP {res.status_code}]{Colors.END} {res.text} ({elapsed_ms}ms)")
            return False, f"HTTP_{res.status_code}"

    except requests.exceptions.RequestException as e:
        print(f"{Colors.RED}[NETWORK ERROR]{Colors.END} {e}")
        return False, "NETWORK_ERROR"


def run_auto_streaming(base_url, interval_seconds=3):
    """
    Simulates students physically entering the lab room in succession.
    Transmits an RFID card tap every `interval_seconds`.
    """
    print(f"\n{Colors.CYAN}>>> Starting Automated RFID Streaming Mode (Every {interval_seconds}s)...{Colors.END}")
    print(f"{Colors.YELLOW}>>> Press Ctrl+C at any time to halt streaming.{Colors.END}\n")

    # Fetch live enrolled students from backend if available
    cards_pool = []
    try:
        resp = requests.get(f"{base_url}/api/students", timeout=3)
        if resp.status_code == 200:
            student_list = resp.json()
            for s in student_list:
                cards_pool.append((s["rfidTagId"], s["name"], s["rollNo"]))
    except Exception:
        pass

    if not cards_pool:
        cards_pool = list(SAMPLE_STUDENT_TAGS)

    # Occasionally include an unregistered card to test 404 handling
    combined_pool = cards_pool + INVALID_TAGS

    tap_count = 0
    try:
        while True:
            tap_count += 1
            # Weighted choice: 85% valid student, 15% invalid badge
            if random.random() < 0.85:
                tag, name, roll = random.choice(cards_pool)
                hint = f"{name} | {roll}"
            else:
                tag, hint = random.choice(INVALID_TAGS)

            transmit_rfid_tap(tag, base_url, student_hint=hint)
            time.sleep(interval_seconds)

    except KeyboardInterrupt:
        print(f"\n{Colors.CYAN}>>> Streaming stopped by user after {tap_count} tap transmissions.{Colors.END}\n")


def run_manual_tap_cli(base_url):
    """Allows manual CLI input of tag IDs."""
    print(f"\n{Colors.CYAN}=== Manual RFID Tag Entry ==={Colors.END}")
    print("Suggested registered tags to test:")
    for tag, name, roll in SAMPLE_STUDENT_TAGS:
        print(f"  * {Colors.BOLD}{tag:<10}{Colors.END} -> {name} ({roll})")
    print(f"  * {Colors.RED}UNKNOWN-999{Colors.END} -> (Tests 404 Not Found response)")
    print("Type 'exit' or 'q' to return to menu.\n")

    while True:
        try:
            user_input = input(f"{Colors.BOLD}Enter RFID Tag ID > {Colors.END}").strip()
            if not user_input:
                continue
            if user_input.lower() in ['exit', 'q', 'quit']:
                break

            transmit_rfid_tap(user_input, base_url)
        except (KeyboardInterrupt, EOFError):
            print("\nExiting manual mode.")
            break


def run_stress_test(base_url):
    """Fires multiple rapid taps to test backend concurrency and duplicate handling."""
    print(f"\n{Colors.CYAN}=== Concurrency & Idempotency Stress Test ==={Colors.END}")
    print("Firing 8 rapid card taps in 1 second...\n")

    tags_to_fire = [
        "TAG-A101",
        "TAG-A101",  # duplicate check
        "TAG-B202",
        "TAG-C303",
        "TAG-B202",  # duplicate check
        "UNKNOWN-999", # 404 check
        "TAG-D404",
        "TAG-E505",
    ]

    for tag in tags_to_fire:
        transmit_rfid_tap(tag, base_url)
        time.sleep(0.15)

    print(f"\n{Colors.GREEN}Stress test batch finished.{Colors.END}\n")


def display_today_feed(base_url):
    """Fetches and displays today's verified attendance records in terminal."""
    try:
        res = requests.get(f"{base_url}/api/attendance/today", timeout=4)
        if res.status_code == 200:
            records = res.json()
            print(f"\n{Colors.CYAN}=== Today's Verified Attendance ({len(records)} Records) ==={Colors.END}")
            if not records:
                print("No attendance recorded yet today.")
                return

            print(f"{'TIME':<12} {'ROLL NO':<14} {'STATUS':<10} {'STUDENT NAME':<24} {'DEPARTMENT'}")
            print("-" * 75)
            for r in records:
                student = r.get("student", {})
                time_str = r.get("timestamp", "").split("T")[-1][:8] if "T" in r.get("timestamp", "") else r.get("timestamp", "")
                status = r.get("status", "PRESENT")
                color = Colors.GREEN if status == "PRESENT" else Colors.YELLOW
                print(f"{time_str:<12} {student.get('rollNo', '—'):<14} {color}{status:<10}{Colors.END} {student.get('name', '—'):<24} {student.get('department', '—')}")
            print("-" * 75 + "\n")
        else:
            print(f"Failed to fetch records (HTTP {res.status_code})")
    except Exception as e:
        print(f"Error fetching feed: {e}")


def interactive_menu(base_url):
    """Main interactive terminal menu."""
    while True:
        print(f"{Colors.BOLD}Select an action:{Colors.END}")
        print("  1) Auto-stream RFID taps every 3 seconds")
        print("  2) Enter manual RFID Tag ID")
        print("  3) Rapid idempotency stress test")
        print("  4) View today's attendance log (GET /api/attendance/today)")
        print("  5) Refresh backend connection status (GET /api/attendance/stats)")
        print("  6) Exit")

        try:
            choice = input(f"\n{Colors.CYAN}Choice [1-6]: {Colors.END}").strip()
            if choice == '1':
                run_auto_streaming(base_url, interval_seconds=3)
            elif choice == '2':
                run_manual_tap_cli(base_url)
            elif choice == '3':
                run_stress_test(base_url)
            elif choice == '4':
                display_today_feed(base_url)
            elif choice == '5':
                check_backend_health(base_url)
            elif choice in ['6', 'q', 'exit', 'quit']:
                print("Exiting RFID emulator. Goodbye!")
                break
            else:
                print(f"{Colors.RED}Invalid selection. Please choose 1 to 6.{Colors.END}\n")
        except (KeyboardInterrupt, EOFError):
            print("\nExiting. Goodbye!")
            break


def main():
    parser = argparse.ArgumentParser(description="RFID Hardware Reader Emulator for Academic Lab Attendance")
    parser.add_argument("--url", default=DEFAULT_BACKEND_URL, help="Base backend URL (default: http://localhost:8080)")
    parser.add_argument("--auto", action="store_true", help="Start automated continuous streaming mode immediately")
    parser.add_argument("--interval", type=int, default=3, help="Interval in seconds for auto streaming (default: 3)")
    parser.add_argument("--tag", type=str, default=None, help="Transmit a single specified RFID Tag ID and exit")
    parser.add_argument("--role", type=str, default="HOD", help="Faculty role: HOD, FACULTY (default: HOD)")
    parser.add_argument("--dept", type=str, default="ALL", help="Faculty department: 'Mechanical Engineering', 'Computer Science & Engineering', or 'ALL' (default: ALL)")

    args = parser.parse_args()

    print_banner(args.url)
    check_backend_health(args.url)

    # CLI Direct mode 1: single tag
    if args.tag:
        transmit_rfid_tap(args.tag, args.url, role=args.role, dept=args.dept)
        sys.exit(0)

    # CLI Direct mode 2: auto streaming flag
    if args.auto:
        run_auto_streaming(args.url, interval_seconds=args.interval)
        sys.exit(0)

    # Interactive menu mode
    interactive_menu(args.url)


if __name__ == "__main__":
    main()
