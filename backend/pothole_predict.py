import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import tkinter as tk
from tkinter import filedialog

# Define model (same as training)
class PotholeClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, stride=1, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1)
        self.fc1 = nn.Linear(32 * 32 * 32, 1)
        self.relu = nn.ReLU()
        self.maxpool = nn.MaxPool2d(2)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.maxpool(self.relu(self.conv1(x)))
        x = self.maxpool(self.relu(self.conv2(x)))
        x = x.view(x.size(0), -1)
        x = self.sigmoid(self.fc1(x))
        return x

# Load trained model
model = PotholeClassifier()
model.load_state_dict(torch.load('pothole_classifier.pth'))
model.eval()

# Prediction function
def predict(image_path):
    img = Image.open(image_path).convert("RGB")
    transform = transforms.Compose([
        transforms.Resize((128, 128)),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
    ])
    img = transform(img).unsqueeze(0)
    
    with torch.no_grad():
        output = model(img)
        prob = output.item()
        result = "Pothole Hai! ⚠️" if prob > 0.7 else "Pothole Nahi Hai ✅"
        return result, prob

# GUI File Selection
if __name__ == "__main__":
    root = tk.Tk()
    root.withdraw()  # Hide main Tkinter window

    while True:
        print("\n📂 Select an image (Cancel to exit)")
        image_path = filedialog.askopenfilename(
            title="Select an image",
            filetypes=[("Image Files", "*.jpg *.jpeg *.png")]
        )
        if not image_path:
            print("Exiting...")
            break

        prediction, confidence = predict(image_path)
        print(f"\nResult: {prediction} | Confidence: {confidence:.2f}")
        print("="*50)
