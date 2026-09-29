from PIL import Image

def remove_white_bg(input_path, output_path, tolerance=30):
    try:
        img = Image.open(input_path).convert("RGBA")
        data = img.getdata()
        new_data = []
        for item in data:
            r, g, b, a = item
            if r > 255 - tolerance and g > 255 - tolerance and b > 255 - tolerance:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path} -> {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

remove_white_bg("public/party-logo.jpeg", "public/party-logo.png", tolerance=40)
remove_white_bg("public/academy-logo.jpeg", "public/academy-logo.png", tolerance=40)
