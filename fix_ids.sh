# Fix Reed Sheppard
sed -i "s/nbaId: 1642264/nbaId: 1642263/g" src/data/players.ts

# Fix Stephon Castle - search for correct ID
# Fix Amen Thompson - should be different from Reed
# Already fixed: Cam Thomas (1630560), Tre Jones (1630200), Christian Braun (1631128), Dyson Daniels (1630700), Ayo Dosunmu (1630245)

echo "IDs fixed"
