import cv2
import numpy as np
import sys
import glob
import os

img_path = sys.argv[1]
img = cv2.imread(img_path)
if img is None:
    print("Could not load image")
    sys.exit(1)

# Convert to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Threshold the sky (assuming the sky is light and the building is relatively darker, or just use edge detection + flood fill)
# Let's try simple thresholding - the sky is very bright blue/white.
ret, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

# Find contours and fill the largest one (the building)
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
if not contours:
    print("No contours found")
    sys.exit(1)

mask = np.zeros_like(gray)
# Assume the largest contour is the building
largest_contour = max(contours, key=cv2.contourArea)
cv2.drawContours(mask, [largest_contour], -1, 255, thickness=cv2.FILLED)

# Create an alpha channel
b_channel, g_channel, r_channel = cv2.split(img)
# The building silhouette should be a solid color, let's say dark grey.
b_channel.fill(30)
g_channel.fill(30)
r_channel.fill(30)

result = cv2.merge((b_channel, g_channel, r_channel, mask))

out_path = os.path.join(os.path.dirname(__file__), 'assets/img/mahal-silhouette.png')
os.makedirs(os.path.dirname(out_path), exist_ok=True)
cv2.imwrite(out_path, result)
print(f"Saved silhouette to {out_path}")
