import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
from io import BytesIO
import os

# Define the same model architecture
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

MODEL_PATH = os.path.join(os.path.dirname(__file__), "pothole_classifier.pth")

# Load trained model
model = PotholeClassifier()
model.load_state_dict(torch.load(MODEL_PATH, map_location="cpu"))
model.eval()

# Image transform
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5])
])

def is_pothole(image_bytes: bytes) -> bool:
    """Predict if the image is a pothole or not"""
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img_tensor = transform(img).unsqueeze(0)
    
    with torch.no_grad():
        output = model(img_tensor)
        prob = output.item()
        return prob > 0.7
