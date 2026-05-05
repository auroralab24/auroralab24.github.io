import shutil
import os

src = "/Users/kimhansol/.gemini/antigravity/brain/6c75015b-2120-4360-9239-e2e8c2aa6078/aurora_lab_liquid_glass_logo_v2_black_bg_1776665915022.png"
dst = "/Users/kimhansol/Library/Mobile Documents/com~apple~CloudDocs/웹/aurora-lab/images/aurora-3d-liquid-glass.png"

try:
    if not os.path.exists(os.path.dirname(dst)):
        os.makedirs(os.path.dirname(dst))
    shutil.copy(src, dst)
    print("Success")
except Exception as e:
    print(f"Error: {e}")
