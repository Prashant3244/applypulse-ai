import os
from PIL import Image, ImageDraw

def create_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background rounded container
    pad = max(1, int(size * 0.06))
    corner_radius = max(2, int(size * 0.22))
    
    # Outer background: Dark Slate
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=corner_radius,
        fill=(15, 23, 42, 255) # slate-900
    )
    
    # Border: Indigo-Cyan gradient vibe
    border_w = max(1, int(size * 0.05))
    draw.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=corner_radius,
        outline=(99, 102, 241, 255), # indigo-500
        width=border_w
    )

    # Document outline or pulse lightning bolt
    # Let's draw an energetic checkmark / lightning bolt in cyan/white
    scale = size / 100.0
    
    # Lightning bolt points scaled to size
    bolt = [
        (int(54 * scale), int(18 * scale)),
        (int(26 * scale), int(54 * scale)),
        (int(48 * scale), int(54 * scale)),
        (int(42 * scale), int(82 * scale)),
        (int(74 * scale), int(44 * scale)),
        (int(52 * scale), int(44 * scale)),
    ]
    draw.polygon(bolt, fill=(6, 182, 212, 255)) # vibrant cyan

    # Inner bright accent
    inner_bolt = [
        (int(53 * scale), int(24 * scale)),
        (int(33 * scale), int(52 * scale)),
        (int(50 * scale), int(52 * scale)),
        (int(45 * scale), int(74 * scale)),
        (int(68 * scale), int(46 * scale)),
        (int(52 * scale), int(46 * scale)),
    ]
    draw.polygon(inner_bolt, fill=(240, 253, 250, 255)) # mint/white highlight

    # Little checkmark dot / accent
    dot_r = max(1, int(3 * scale))
    draw.ellipse(
        [int(22 * scale) - dot_r, int(76 * scale) - dot_r,
         int(22 * scale) + dot_r, int(76 * scale) + dot_r],
        fill=(99, 102, 241, 255)
    )
    
    return img

def main():
    icons_dir = "/data/data/com.termux/files/home/applypulse-extension/icons"
    os.makedirs(icons_dir, exist_ok=True)
    
    sizes = [16, 48, 128, 300]
    for s in sizes:
        icon = create_icon(s)
        icon.save(os.path.join(icons_dir, f"icon{s}.png"))
        print(f"Generated icon{s}.png")

if __name__ == "__main__":
    main()
