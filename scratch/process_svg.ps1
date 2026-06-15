# Script to convert SVG to PNG with padding using .NET (built-in to PowerShell)
# This avoids needing to install external npm packages that might conflict

$svgPath = "d:\projects\Sosial_E-Commers_Marketplace\Zeven\icon-zeven.svg"
$outputPath = "d:\projects\Sosial_E-Commers_Marketplace\Zeven\resources\icon-only.png"
$splashPath = "d:\projects\Sosial_E-Commers_Marketplace\Zeven\resources\splash.png"

# Since I cannot easily render SVG to PNG via pure PowerShell without extra libraries,
# I will try to use the @capacitor/assets ability to use SVG if it supports it, 
# OR I will use a different approach.

# Let's check if capacitor-assets supports SVG directly as source
# If I rename it to icon.svg and put it in resources, it might work.
