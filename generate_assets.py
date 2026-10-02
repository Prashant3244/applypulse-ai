import os
from PIL import Image, ImageDraw

def create_screenshot(output_dir):
    width, height = 1280, 800
    img = Image.new("RGB", (width, height), (15, 23, 42)) # slate-900
    draw = ImageDraw.Draw(img)

    # Browser header bar
    draw.rectangle([0, 0, width, 50], fill=(30, 41, 59))
    draw.line([0, 50, width, 50], fill=(51, 65, 85), width=1)
    
    # Browser window controls
    draw.ellipse([20, 18, 32, 30], fill=(239, 68, 68))
    draw.ellipse([40, 18, 52, 30], fill=(245, 158, 11))
    draw.ellipse([60, 18, 72, 30], fill=(16, 185, 129))

    # URL bar
    draw.rounded_rectangle([120, 10, 800, 40], radius=8, fill=(15, 23, 42), outline=(51, 65, 85))
    draw.text((140, 17), "https://stripe.wd1.myworkdayjobs.com/careers/job/Senior-Software-Engineer", fill=(148, 163, 184))

    # Left Section: Simulated Career Application Form
    form_x, form_y, form_w, form_h = 60, 80, 760, 680
    draw.rounded_rectangle([form_x, form_y, form_x + form_w, form_y + form_h], radius=16, fill=(30, 41, 59), outline=(51, 65, 85), width=2)

    # Job Header
    draw.text((form_x + 30, form_y + 25), "Senior Software Engineer - Infrastructure & Core Systems", fill=(248, 250, 252))
    draw.text((form_x + 30, form_y + 55), "Stripe • San Francisco, CA • Full-time • $185,000 - $225,000", fill=(56, 189, 248))

    # Application Fields with Autofill Emerald Rings
    fields = [
        ("First Name", "Alex"),
        ("Last Name", "Taylor"),
        ("Email Address", "alex.taylor@example.com"),
        ("Phone Number", "+1 (555) 349-2041"),
        ("Street Address", "742 Evergreen Terrace"),
        ("LinkedIn URL", "https://linkedin.com/in/alextaylor-pro"),
    ]

    for idx, (label, val) in enumerate(fields):
        col = idx % 2
        row = idx // 2
        fx = form_x + 30 + (col * 350)
        fy = form_y + 105 + (row * 70)

        draw.text((fx, fy), label, fill=(148, 163, 184))
        # Highlighted filled field
        draw.rounded_rectangle([fx, fy + 20, fx + 320, fy + 55], radius=8, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
        draw.text((fx + 12, fy + 28), val, fill=(240, 253, 250))
        draw.text((fx + 295, fy + 28), "✔", fill=(16, 185, 129))

    # Textarea field with AI Badge
    ta_y = form_y + 340
    draw.text((form_x + 30, ta_y), "Why are you interested in joining our team? (Screening Question)", fill=(148, 163, 184))
    
    # Inline AI Badge
    draw.rounded_rectangle([form_x + 560, ta_y - 4, form_x + 700, ta_y + 20], radius=6, fill=(79, 70, 229))
    draw.text((form_x + 575, ta_y), "✨ AI Draft Answer", fill=(255, 255, 255))

    # Textarea Box
    draw.rounded_rectangle([form_x + 30, ta_y + 26, form_x + 730, ta_y + 150], radius=8, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
    sample_text = (
        "I have followed Stripe's financial infrastructure developments closely. With 6+ years driving\n"
        "distributed services and high-concurrency APIs, my core background in React, Node, and AWS\n"
        "aligns directly with the developer experience and platform scaling goals of this team."
    )
    draw.text((form_x + 44, ta_y + 40), sample_text, fill=(240, 253, 250), spacing=8)

    # Right Section: Injected ApplyPulse AI Floating HUD
    hud_x, hud_y, hud_w, hud_h = 850, 110, 370, 580
    draw.rounded_rectangle([hud_x, hud_y, hud_x + hud_w, hud_y + hud_h], radius=16, fill=(15, 23, 42), outline=(99, 102, 241), width=2)

    # HUD Header
    draw.rounded_rectangle([hud_x, hud_y, hud_x + hud_w, hud_y + 60], radius=16, fill=(30, 41, 59))
    draw.text((hud_x + 24, hud_y + 18), "⚡ ApplyPulse AI Copilot", fill=(255, 255, 255))
    draw.rounded_rectangle([hud_x + 280, hud_y + 16, hud_x + 345, hud_y + 44], radius=6, fill=(16, 185, 129))
    draw.text((hud_x + 296, hud_y + 23), "PRO", fill=(4, 47, 46))

    # Platform Banner
    draw.rounded_rectangle([hud_x + 20, hud_y + 80, hud_x + hud_w - 20, hud_y + 130], radius=8, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((hud_x + 35, hud_y + 95), "Detected ATS Portal:", fill=(148, 163, 184))
    draw.text((hud_x + 210, hud_y + 95), "● Workday Core", fill=(56, 189, 248))

    # Big 1-Click Autofill Button
    draw.rounded_rectangle([hud_x + 20, hud_y + 150, hud_x + hud_w - 20, hud_y + 215], radius=10, fill=(79, 70, 229))
    draw.text((hud_x + 65, hud_y + 172), "⚡ 1-Click Autofill Form", fill=(255, 255, 255))

    # Success Counter Box
    draw.rounded_rectangle([hud_x + 20, hud_y + 230, hud_x + hud_w - 20, hud_y + 295], radius=8, fill=(16, 185, 129, 30), outline=(16, 185, 129))
    draw.text((hud_x + 40, hud_y + 252), "✨ 14 Fields Autofilled & Verified!", fill=(16, 185, 129))

    # Save to Tracker Button
    draw.rounded_rectangle([hud_x + 20, hud_y + 315, hud_x + hud_w - 20, hud_y + 370], radius=8, fill=(30, 41, 59), outline=(71, 85, 105))
    draw.text((hud_x + 85, hud_y + 332), "💾 Saved to Job Tracker CRM", fill=(203, 213, 225))

    # Profile Details Preview
    draw.rounded_rectangle([hud_x + 20, hud_y + 395, hud_x + hud_w - 20, hud_y + 510], radius=8, fill=(30, 41, 59), outline=(51, 65, 85))
    draw.text((hud_x + 35, hud_y + 410), "Candidate: Alex Taylor", fill=(255, 255, 255))
    draw.text((hud_x + 35, hud_y + 435), "Target Role: Senior Software Engineer", fill=(148, 163, 184))
    draw.text((hud_x + 35, hud_y + 460), "Work Authorization: US Citizen / Permanent", fill=(16, 185, 129))
    draw.text((hud_x + 35, hud_y + 485), "AI Screening Model: Tailored Tech Profile", fill=(56, 189, 248))

    filepath = os.path.join(output_dir, "applypulse_screenshot_1280x800.png")
    img.save(filepath)
    print(f"Screenshot created: {filepath}")

def create_small_tile(output_dir):
    width, height = 440, 280
    img = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    draw.rectangle([0, 0, width, height], outline=(99, 102, 241), width=3)
    
    # Graphic pulse line
    draw.line([(30, 160), (120, 160), (160, 90), (200, 210), (240, 120), (320, 120), (410, 50)], fill=(6, 182, 212), width=4)

    draw.text((35, 35), "⚡ ApplyPulse AI", fill=(255, 255, 255))
    draw.text((35, 70), "Workday & ATS 1-Click Job Copilot", fill=(56, 189, 248))

    draw.text((35, 185), "• 1-Click Autofill (Workday, Greenhouse, Lever)", fill=(203, 213, 225))
    draw.text((35, 212), "• AI Contextual Answers for Screening Questions", fill=(203, 213, 225))
    draw.text((35, 240), "• Built-in Job Tracker CRM with CSV Export", fill=(16, 185, 129))

    filepath = os.path.join(output_dir, "applypulse_small_tile_440x280.png")
    img.save(filepath)
    print(f"Small tile created: {filepath}")

def create_large_tile(output_dir):
    width, height = 1400, 560
    img = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    draw.rectangle([0, 0, width, height], outline=(99, 102, 241), width=4)
    draw.rectangle([6, 6, width-6, height-6], outline=(6, 182, 212), width=2)

    points = [
        (40, 360), (220, 360), (320, 200), (420, 440),
        (560, 260), (740, 260), (940, 120), (1120, 120), (1340, 70)
    ]
    draw.line(points, fill=(99, 102, 241), width=10, joint="curve")
    draw.line(points, fill=(6, 182, 212), width=5, joint="curve")

    draw.text((80, 70), "⚡ ApplyPulse AI", fill=(255, 255, 255))
    draw.text((80, 125), "UNIVERSAL WORKDAY & ATS 1-CLICK JOB APPLICATION COPILOT", fill=(6, 182, 212))

    draw.text((80, 220), "✔ 1-Click Form Filling for Workday, Greenhouse, Lever, Ashby, BambooHR", fill=(226, 232, 240))
    draw.text((80, 270), "✔ AI Screening Question Generator (Contextual, Articulate Answers)", fill=(226, 232, 240))
    draw.text((80, 320), "✔ Synthetic React/Vue Event Dispatch (Never Drops Filled Data)", fill=(226, 232, 240))
    draw.text((80, 370), "✔ Application CRM Tracker & 1-Click Export to CSV / Google Sheets", fill=(16, 185, 129))

    draw.rounded_rectangle([1060, 440, 1330, 500], radius=10, fill=(79, 70, 229))
    draw.text((1100, 460), "CHROME WEB STORE READY", fill=(255, 255, 255))

    filepath = os.path.join(output_dir, "applypulse_large_tile_1400x560.png")
    img.save(filepath)
    print(f"Large tile created: {filepath}")

def main():
    dest_dir = "/storage/emulated/0/Download"
    os.makedirs(dest_dir, exist_ok=True)
    create_screenshot(dest_dir)
    create_small_tile(dest_dir)
    create_large_tile(dest_dir)

if __name__ == "__main__":
    main()
