import math
import fitz  # PyMuPDF for PDF image extraction
import imagehash
from PIL import Image
import os
import tempfile
import shutil  # To remove the temporary directory

anglemap = {
    -165:7,
    -135:8,
    -105:9,
    -75:10,
    -45:11,
    -15:12,
    15:1,
    45:2,
    75:3,
    105:4,
    135:5,
    165:6
}

def extract_images_from_pdf(pdf_path, temp_dir):
    """Extract images from a PDF, track their order of appearance, and return only 88x88 images as a list of tuples (image_hash, image_data, image_size)."""
    pdf_document = fitz.open(pdf_path)
    extracted_images = []

    for page_number in range(len(pdf_document)):
        page = pdf_document.load_page(page_number)
        image_list = page.get_images(full=True)
        image_info = page.get_image_info(image_list[0][0])

        for img_index, img in enumerate(image_list):
            xref = img[0]
            base_image = pdf_document.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = os.path.join(temp_dir, f"temp_image_{img_index}.{image_ext}")
            idx = img[7].replace("Im", "")
            image_transform = image_info[int(idx)]['transform']

            # Save the image temporarily in the temp directory to calculate the hash
            with open(image_filename, "wb") as image_file:
                image_file.write(image_bytes)

            # Open the saved image to calculate its hash and check its size
            with Image.open(image_filename) as img_obj:
                image_size = img_obj.size  # Get image size (width, height)

                # Only process images that are exactly 88x88 in size
                if image_size == (88, 88):
                    image_hash = imagehash.average_hash(img_obj)
                    # Append only 88x88 images
                    extracted_images.append((image_hash, image_filename, image_size, img_index, image_transform))

    return extracted_images

def get_image_hashes_from_directory(directory_path):
    """Calculate hashes for all 88x88 images in the given directory and return them as a list of tuples (image_hash, file_path, image_size)."""
    directory_image_hashes = []

    for filename in os.listdir(directory_path):
        if filename.lower().endswith((".png", ".jpg", ".jpeg", ".bmp", ".gif")):
            file_path = os.path.join(directory_path, filename)
            with Image.open(file_path) as img_obj:
                image_size = img_obj.size  # Get image size (width, height)
                
                # Only process images that are exactly 88x88 in size
                if image_size == (88, 88):
                    image_hash = imagehash.average_hash(img_obj)
                    directory_image_hashes.append((image_hash, file_path, image_size))

    return directory_image_hashes

def compare_images_based_on_order(extracted_images, directory_images):
    """Compare extracted images with reference images based on their appearance order."""
    output = [None] * len(extracted_images)

    # Sort the extracted images by their order of appearance (img_index)
    extracted_images = sorted(extracted_images, key=lambda x: x[3])  # Sort by img_index

    for idx, (pdf_hash, pdf_image, pdf_size, pdf_index, pdf_transform) in enumerate(extracted_images):
        if pdf_size == (88, 88):  # Only compare if the extracted image is 88x88
            for dir_hash, dir_image, dir_size in directory_images:
                if pdf_hash == dir_hash and pdf_size == dir_size:
                    a, b, c, d, e, f = pdf_transform
                    angle = round(math.degrees(math.atan2(b, a)))
                    output[anglemap[angle] - 1] = dir_image.replace("references/", "").replace(".png", "")
                    break

    return output

def analyze_sectors_using_order(pdf_dir_path, reference_dir_path):
    """Process all PDFs in a directory, extract images, and report the contents of each sector based on image matching."""
    results = {}

    # Get reference images and their hashes
    directory_images = get_image_hashes_from_directory(reference_dir_path)

    # Create a temporary directory
    temp_dir = tempfile.mkdtemp()

    try:
        # Loop through each PDF in the directory
        for pdf in os.listdir(pdf_dir_path):
            pdf_path = os.path.join(pdf_dir_path, pdf)
            if pdf_path.lower().endswith('.pdf'):
                # Extract only 88x88 images and their order of appearance from the PDF
                extracted_images = extract_images_from_pdf(pdf_path, temp_dir)

                # Compare the extracted images with reference images
                sector_contents = compare_images_based_on_order(extracted_images, directory_images)
                results[pdf] = sector_contents

    finally:
        # Clean up: Delete the temporary directory and its contents
        shutil.rmtree(temp_dir)

    return results

# Usage example
pdf_dir_path = "files/"  # Directory containing the PDF files
reference_dir_path = "references/"  # Directory containing reference images

# Analyze all PDFs in the directory
sector_analysis_results = analyze_sectors_using_order(pdf_dir_path, reference_dir_path)

# Print out the results for each PDF
for pdf_file, sectors in sector_analysis_results.items():
    print(f"{pdf_file}: {sectors}")
