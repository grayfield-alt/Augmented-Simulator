import os

file_path = r'c:\Users\LEE\.gemini\antigravity\scratch\projects\AugmentedSimulator_Main\public\proto2.html'
output_path = r'c:\Users\LEE\.gemini\antigravity\scratch\projects\AugmentedSimulator_Main\proto2.html'

def fix_content(content):
    try:
        # The content is read as UTF-8, but it contains mojibake
        # To fix it: encode as cp949 to get back the original bytes, then decode as utf-8
        fixed = content.encode('cp949', errors='replace').decode('utf-8', errors='replace')
        return fixed
    except Exception as e:
        print(f"Error during fix: {e}")
        return content

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed_content = fix_content(content)
    
    # Remove problematic script tag if present
    fixed_content = fixed_content.replace('<script type="module" src="./src/main.ts"></script>', '')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print(f"Successfully fixed and saved to {output_path}")

except Exception as e:
    print(f"File process error: {e}")
