#!/bin/bash
for f in images/*.mov; do
    echo "Converting $f..."
    out="${f%.mov}.mp4"
    avconvert -s "$f" -p Preset960x540 -o "$out" --replace
done
echo "All conversions complete."
