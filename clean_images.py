import os
import re

# Define the paths
html_folder = "/Users/zenos/Documents/Spring 2025 Semester (KU)/ITEC490 - Capstone/ITEC490-Capstone Project/frontend"
img_folder = os.path.join(html_folder, "assets/img")

# Collect all image references from HTML and CSS files
image_references = set()
for root, _, files in os.walk(html_folder):
    for file in files:
        if file.endswith((".html", ".css")):
            with open(os.path.join(root, file), "r") as f:
                content = f.read()
                # Find all image references
                matches = re.findall(r'assets/img/[\w\-.]+', content)
                image_references.update(matches)

# Collect all images in the img folder
all_images = set(os.listdir(img_folder))

# Find unused images
unused_images = all_images - {os.path.basename(img) for img in image_references}

# Print unused images
print("Unused images:")
for img in unused_images:
    print(img)

# Optionally, delete unused images
for img in unused_images:
    os.remove(os.path.join(img_folder, img))
    print(f"Deleted: {img}")