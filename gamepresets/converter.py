import json
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

# Create a temporary directory
temp_dir = tempfile.mkdtemp()

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

def get_sectors(pdf_path):
    """Process all PDFs in a directory, extract images, and report the contents of each sector based on image matching."""
    results = {}

    # Get reference images and their hashes
    directory_images = get_image_hashes_from_directory("references/")

    # Extract only 88x88 images and their order of appearance from the PDF
    extracted_images = extract_images_from_pdf(pdf_path, temp_dir)

    # Compare the extracted images with reference images
    sector_contents = compare_images_based_on_order(extracted_images, directory_images)
    results = sector_contents
    # print(f"{pdf_path}: {sector_contents}")

    return results










def get_text_from_pdf(pdf_path):
    """Extract text from a PDF and return it as a string."""
    pdf_document = fitz.open(pdf_path)
    text = ""
    for page in pdf_document:
        text += page.get_text()
    pdf_document.close()
    return text

def get_research_from_pdf(text):
    """Extract research from a PDF and return it as a string."""
    
    research = {"A":{}, "B":{}, "C":{}, "D":{}, "E":{}, "F":{}, "X1":{}}
    temp = []
    # text = get_text_from_pdf(pdf_path)
    text = text.split(":")

    pdf = pdf_path.replace(".pdf", "").replace("files/", "")

    for i in range(1, 8):
        temp.append(text[i][:-1].replace("\n", "").strip())

    research["A"]["title"] = temp[0]
    research["B"]["title"] = temp[1]
    research["C"]["title"] = temp[2]
    research["D"]["title"] = temp[3]
    research["E"]["title"] = temp[4]
    research["F"]["title"] = temp[5][:-13]
    research["X1"]["title"] = temp[6].split(pdf)[0]
    research["X1"]["content"] = temp[6].split(pdf)[1][:-1]

    research["A"]["content"] = text[8].replace("\n", "").split(pdf)[1][:-1]
    research["B"]["content"] = text[9].replace("\n", "").split(pdf)[1][:-1]
    research["C"]["content"] = text[10].replace("\n", "").split(pdf)[1][:-1]
    research["D"]["content"] = text[11].replace("\n", "").split(pdf)[1][:-1]
    research["E"]["content"] = text[12].replace("\n", "").split(pdf)[1][:-1]
    research["F"]["content"] = text[13].replace("\n", "").split(pdf)[1][:-1]

    return research

def get_planetx_location(text):
    """Extract planetx location from a PDF and return it as a string."""

    text = int(text.split("-")[1].replace("\nSector", "").strip()) # Don't worry about it :P

    return text

def get_starting_info(text):
    """Extract starting info from a PDF and return it as a string."""

    text = text.split("sector")
    temp = []
    info = {"Spring": [], "Summer": [], "Autumn": [], "Winter": []}

    info["Spring"] = [None] * 12
    info["Summer"] = [None] * 12
    info["Autumn"] = [None] * 12
    info["Winter"] = [None] * 12

    for i in range(1, len(text)):
        if text[i].startswith("\nn"):
            temp.append(text[i].strip())

    spring = temp[0].split("\n") + temp[1].split("\n") + temp[2].split("\n")
    summer = temp[3].split("\n") + temp[4].split("\n") + temp[5].split("\n")
    autumn = temp[6].split("\n") + temp[7].split("\n") + temp[8].split("\n")
    winter = temp[9].split("\n") + temp[10].split("\n") + temp[11].split("\n")

    spring = spring[:-6]
    summer = summer[:-6]
    autumn = autumn[:-6]
    winter = winter[:-6]

    for i, x in enumerate(spring):
        idx = math.floor(i/2)
        if i % 2 == 0:
            info["Spring"][idx] = {"sector": spring[i + 1], "content": spring[i]}
            info["Summer"][idx] = {"sector": summer[i + 1], "content": summer[i]}
            info["Autumn"][idx] = {"sector": autumn[i + 1], "content": autumn[i]}
            info["Winter"][idx] = {"sector": winter[i + 1], "content": winter[i]}

    return info







files = "files/"

output = []

try:

    for pdf in os.listdir(files):
        pdf_path = os.path.join(files, pdf)
        if pdf_path.lower().endswith('.pdf'):
            pdf = pdf_path.replace(".pdf", "").replace(files, "")

            text = get_text_from_pdf(pdf_path)

            sectors = get_sectors(pdf_path)
            research = get_research_from_pdf(text)
            xsector = get_planetx_location(text)
            info = get_starting_info(text)

            game = {"code": pdf, "sectors": sectors, "planetx": xsector, "research": research, "info": info}
            
            # print(f"{pdf}: {sectors}")
            # print(f"{pdf}: {research}")
            print(f"Parsing: {pdf}")

            output.append(game)

finally:
        # Clean up: Delete the temporary directory and its contents
        shutil.rmtree(temp_dir)

file = open('output.json', 'w')
file.write(json.dumps(output, indent=4))