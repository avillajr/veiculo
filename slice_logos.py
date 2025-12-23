import cv2
import numpy as np
import os

def slice_logos():
    try:
        img_path = "assets/partners_sprite.png"
        with open(img_path, "rb") as f:
            bytes_data = f.read()
        file_bytes = np.frombuffer(bytes_data, dtype=np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_UNCHANGED)
        
        if img is None: return

        if img.shape[2] == 4:
            alpha = img[:, :, 3]
            _, thresh = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)
        else:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            # Invert so text is white, bg is black
            _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

        # DILATE to merge nearby letters into single logo blocks
        kernel = np.ones((20,20), np.uint8) # Aggressive dilation
        dilated = cv2.dilate(thresh, kernel, iterations=1)

        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        boxes = []
        for c in contours:
            x, y, w, h = cv2.boundingRect(c)
            # Filter based on size
            if w > 50 and h > 20: 
                boxes.append((x, y, w, h))

        if not boxes: return

        # Sort: First by Y (grouping into rows), then by X
        # We know there are likely 2 rows.
        # Find min and max Y to normalize
        min_y = min(b[1] for b in boxes)
        max_y = max(b[1] for b in boxes)
        mid_y = (min_y + max_y) / 2
        
        row1 = []
        row2 = []
        
        for b in boxes:
            if b[1] + b[3]/2 < mid_y + 50: # Upper half
                row1.append(b)
            else:
                row2.append(b)
                
        row1.sort(key=lambda b: b[0])
        row2.sort(key=lambda b: b[0])
        
        sorted_boxes = row1 + row2

        print(f"Found {len(sorted_boxes)} unified logos.")

        output_dir = "assets"
        names = ["porto", "azul", "hdi", "liberty", "tokio", "mapfre", "ituran", "suhai"]

        for i, (x, y, w, h) in enumerate(sorted_boxes):
            if i >= len(names): break
            # Use original image to crop, but use the dilated bounding box? 
            # No, the dilated box might be too big or loose. 
            # Better: The dilated box defines the ROI. We can verify if we want to tighten it.
            # For simplicity, let's just use the dilated box but subtract a bit of the kernel size or just accept the white space (safer).
            # Actually, let's just use the box from dilation, it ensures we don't cut text.
            
            # Clamp
            pad = 0
            x1 = max(0, x - pad)
            y1 = max(0, y - pad)
            x2 = min(img.shape[1], x + w + pad)
            y2 = min(img.shape[0], y + h + pad)
            
            crop = img[y1:y2, x1:x2]
            
            out_name = f"partner-{names[i]}.png"
            full_out_path = os.path.join(output_dir, out_name)
            is_success, buffer = cv2.imencode(".png", crop)
            if is_success:
                with open(full_out_path, "wb") as f_out:
                    f_out.write(buffer)
                print(f"Saved {out_name}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    slice_logos()
