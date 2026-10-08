"""Script to generate high-resolution ER Diagram for docs/er-diagram.png using Pillow."""

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


def draw_rounded_rect(draw, bbox, radius, fill, outline=None, width=1):
    x1, y1, x2, y2 = bbox
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill, outline=outline, width=width)


def generate_er_diagram(output_path: Path):
    # High-resolution canvas
    W, H = 1600, 960
    img = Image.new("RGBA", (W, H), (15, 23, 42, 255)) # Dark slate (#0F172A)
    draw = ImageDraw.Draw(img)

    # Try loading system font, fallback to default
    try:
        font_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 28)
        font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 15)
        font_header = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 18)
        font_body = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 14)
        font_type = ImageFont.truetype("/System/Library/Fonts/Supplemental/Courier New.ttf", 13)
        font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 11)
        font_legend = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 13)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = font_header = font_body = font_type = font_badge = font_legend = ImageFont.load_default()

    # Title & Subtitle banner
    draw.text((60, 40), "Team Recruitment Automation Tool — Minimal 4-Table ER Diagram", fill=(248, 250, 252), font=font_title)
    draw.text((60, 78), "PostgreSQL Database Architecture | Member 4 (Database & Integration) | Incursion Track 3", fill=(148, 163, 184), font=font_sub)

    # Table Definitions
    # Layout:
    # Top-Left: datasets (100, 140)
    # Top-Right: configurations (860, 140)
    # Bottom-Left: runs (100, 520)
    # Bottom-Right: overrides (860, 520)

    tables = {
        "datasets": {
            "title": "datasets",
            "subtitle": "Raw input & normalized teams",
            "header_bg": (13, 148, 136), # Teal (#0D9488)
            "box": (80, 140, 680, 470),
            "columns": [
                ("id", "UUID", "PK", False),
                ("name", "VARCHAR(255)", "REQ", False),
                ("uploaded_at", "TIMESTAMPTZ", "DEF:NOW", False),
                ("content_hash", "VARCHAR(64)", "SHA-256", False),
                ("teams_json", "JSONB", "NORMALIZED", True),
                ("validation_report_json", "JSONB", "REPORT", True),
            ],
            "note": "Stores exact uploaded state for 100% reproducible evaluations.",
        },
        "configurations": {
            "title": "configurations",
            "subtitle": "Scoring rules & strategy presets",
            "header_bg": (99, 102, 241), # Indigo (#6366F1)
            "box": (880, 140, 1480, 440),
            "columns": [
                ("id", "UUID", "PK", False),
                ("name", "VARCHAR(255)", "REQ", False),
                ("is_preset", "BOOLEAN", "DEF:FALSE", False),
                ("config_json", "JSONB", "SCORING_CFG", True),
                ("created_at", "TIMESTAMPTZ", "DEF:NOW", False),
            ],
            "note": "Holds criteria, weights, eligibility rules, and presets across hackathons.",
        },
        "runs": {
            "title": "runs",
            "subtitle": "Immutable evaluation history & rankings",
            "header_bg": (2, 132, 199), # Sky Blue (#0284C7)
            "box": (80, 550, 680, 900),
            "columns": [
                ("id", "UUID", "PK", False),
                ("dataset_id", "UUID", "FK -> datasets.id", False),
                ("config_snapshot_json", "JSONB", "SNAPSHOT", True),
                ("run_hash", "VARCHAR(64)", "SHA-256", False),
                ("results_json", "JSONB", "SCORES & RANKS", True),
                ("created_at", "TIMESTAMPTZ", "DEF:NOW", False),
            ],
            "note": "Runs freeze config_snapshot_json; results_json contains ranks & explanations.",
        },
        "overrides": {
            "title": "overrides",
            "subtitle": "Auditable organizer decisions",
            "header_bg": (217, 119, 6), # Amber (#D97706)
            "box": (880, 550, 1480, 900),
            "columns": [
                ("id", "UUID", "PK", False),
                ("run_id", "UUID", "FK -> runs.id", False),
                ("team_id", "VARCHAR(64)", "TARGET TEAM", False),
                ("action", "VARCHAR(20)", "pin|exclude|waitlist", False),
                ("reason", "TEXT", "AUDIT NOTE", False),
                ("created_at", "TIMESTAMPTZ", "DEF:NOW", False),
            ],
            "note": "Strictly auditable. NEVER rewrites or modifies automated runs.results_json.",
        },
    }

    # Render each table card
    for name, tbl in tables.items():
        x1, y1, x2, y2 = tbl["box"]
        # Outer Card
        draw_rounded_rect(draw, (x1, y1, x2, y2), radius=12, fill=(30, 41, 59), outline=(51, 65, 85), width=2)
        # Header banner
        draw.rounded_rectangle([x1, y1, x2, y1 + 54], radius=12, fill=tbl["header_bg"])
        # Fix bottom corners of header
        draw.rectangle([x1, y1 + 42, x2, y1 + 54], fill=tbl["header_bg"])

        # Table Header Text
        draw.text((x1 + 18, y1 + 10), tbl["title"].upper(), fill=(255, 255, 255), font=font_header)
        draw.text((x1 + 18, y1 + 32), tbl["subtitle"], fill=(226, 232, 240), font=font_legend)

        # Columns
        row_y = y1 + 68
        for col_name, col_type, badge, is_json in tbl["columns"]:
            # alternating row highlight
            # Column Name
            col_color = (250, 204, 21) if "PK" in badge else ((56, 189, 248) if "FK" in badge else (241, 245, 249))
            draw.text((x1 + 24, row_y), col_name, fill=col_color, font=font_body)

            # Data Type
            type_color = (192, 132, 252) if is_json else (148, 163, 184)
            draw.text((x1 + 270, row_y), col_type, fill=type_color, font=font_type)

            # Badge pill
            badge_color = (202, 138, 4) if "PK" in badge else ((14, 165, 233) if "FK" in badge else ((168, 85, 247) if is_json else (71, 85, 105)))
            pill_x2 = x2 - 20
            pill_w = len(badge) * 8 + 14
            pill_x1 = pill_x2 - pill_w
            draw_rounded_rect(draw, (pill_x1, row_y - 2, pill_x2, row_y + 16), radius=5, fill=badge_color)
            draw.text((pill_x1 + 7, row_y), badge, fill=(255, 255, 255), font=font_badge)

            row_y += 34

        # Table Bottom Note
        draw.rectangle([x1 + 14, y2 - 40, x2 - 14, y2 - 39], fill=(51, 65, 85))
        draw.text((x1 + 20, y2 - 28), tbl["note"], fill=(148, 163, 184), font=font_legend)

    # --------------------------------------------------------------------------
    # RELATIONSHIP LINES & CONNECTORS
    # --------------------------------------------------------------------------

    # Relationship 1: datasets (1) -> (many) runs
    # Connect bottom of datasets (box 80, 140, 680, 470) to top of runs (box 80, 550, 680, 900)
    line1_x = 380
    draw.line([(line1_x, 470), (line1_x, 550)], fill=(56, 189, 248), width=3)
    # Circle at 1-end
    draw.ellipse([line1_x - 6, 470, line1_x + 6, 482], fill=(56, 189, 248))
    # Crow's foot / arrow at N-end
    draw.polygon([(line1_x, 550), (line1_x - 10, 532), (line1_x + 10, 532)], fill=(56, 189, 248))
    # Relationship Label Badge
    draw_rounded_rect(draw, (line1_x + 15, 495, line1_x + 195, 525), radius=6, fill=(15, 23, 42), outline=(56, 189, 248), width=1)
    draw.text((line1_x + 25, 502), "1 : N (dataset_id)", fill=(224, 242, 254), font=font_legend)

    # Relationship 2: runs (1) -> (many) overrides
    # Connect right of runs (680, 720) to left of overrides (880, 720)
    line2_y = 720
    draw.line([(680, line2_y), (880, line2_y)], fill=(245, 158, 11), width=3)
    # Circle at 1-end
    draw.ellipse([678, line2_y - 6, 690, line2_y + 6], fill=(245, 158, 11))
    # Arrow at N-end
    draw.polygon([(880, line2_y), (862, line2_y - 10), (862, line2_y + 10)], fill=(245, 158, 11))
    # Label badge
    draw_rounded_rect(draw, (730, line2_y - 28, 830, line2_y - 2), radius=6, fill=(15, 23, 42), outline=(245, 158, 11), width=1)
    draw.text((740, line2_y - 22), "1 : N (run_id)", fill=(254, 243, 199), font=font_legend)

    # Note Badge between configurations and runs (Decoupling)
    draw_rounded_rect(draw, (920, 465, 1440, 520), radius=8, fill=(30, 41, 59), outline=(99, 102, 241), width=1)
    draw.text((935, 474), "Config Decoupling: runs embed config_snapshot_json directly.", fill=(199, 210, 254), font=font_legend)
    draw.text((935, 495), "Saved configurations can evolve without altering past run results.", fill=(148, 163, 184), font=font_legend)

    # Legend at bottom right / footer
    output_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(str(output_path), "PNG")
    print(f"ER diagram successfully generated at {output_path}")


if __name__ == "__main__":
    out = Path("docs/er-diagram.png")
    generate_er_diagram(out)
