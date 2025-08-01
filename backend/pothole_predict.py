import torch
from PIL import Image
import os

# Model load karein
model = PotholeClassifier()
model.load_state_dict(torch.load('pothole_classifier.pth'))
model.eval()

def predict(image_path):
    try:
        img = Image.open(image_path)
        # Transform karein (training jaisa hi)
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
    except Exception as e:
        return f"Error: {str(e)}", 0.0

# Test karein
if __name__ == "__main__":
    print("Pothole Detector v1.0")
    while True:
        img_path = input("\nImage ka path daalo (exit ke liye 'q' dabao): ")
        if img_path.lower() == 'q':
            break
        if not os.path.exists(img_path):
            print("⚠️ File nahi mili! Sahi path daalo")
            continue
            
        prediction, confidence = predict(img_path)
        print(f"\nResult: {prediction} | Confidence: {confidence:.2f}")
        print("="*50)