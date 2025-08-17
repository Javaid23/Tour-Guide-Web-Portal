# Destination Images Organization Guide

## Main Image Folders Created

### 1. **Featured Destinations** (Homepage)
```
/images/featured/
├── lahore.jpg ✅ (Already added)
├── skardu.jpg ✅ (Already added)
└── hunza.jpg ✅ (Already added)
```

### 2. **All Destinations by Province**
```
/images/destinations/
├── gilgit-baltistan/
│   ├── hunza/
│   │   ├── baltit-fort.jpg
│   │   ├── altit-fort.jpg
│   │   ├── eagles-nest.jpg
│   │   ├── attabad-lake.jpg
│   │   ├── passu-cones.jpg
│   │   └── karimabad.jpg
│   ├── skardu/
│   │   ├── shangrila-resort.jpg
│   │   ├── upper-kachura-lake.jpg
│   │   ├── deosai-plains.jpg
│   │   ├── satpara-lake.jpg
│   │   ├── shigar-fort.jpg
│   │   └── cold-desert.jpg
│   ├── fairy-meadows/
│   │   ├── nanga-parbat.jpg
│   │   ├── beyal-camp.jpg
│   │   └── alpine-views.jpg
│   └── k2-basecamp/
│       ├── baltoro-glacier.jpg
│       ├── concordia.jpg
│       └── k2-base.jpg
│
├── punjab/
│   ├── lahore/
│   │   ├── badshahi-mosque.jpg
│   │   ├── lahore-fort.jpg
│   │   ├── shalimar-gardens.jpg
│   │   └── food-street.jpg
│   ├── islamabad/
│   │   ├── faisal-mosque.jpg
│   │   ├── daman-e-koh.jpg
│   │   └── margalla-hills.jpg
│   ├── murree/
│   └── multan/
│
├── sindh/
│   ├── karachi/
│   │   ├── quaid-mausoleum.jpg
│   │   ├── clifton-beach.jpg
│   │   └── maritime-museum.jpg
│   └── hyderabad/
│
├── kpk/
│   ├── swat/
│   │   ├── mingora.jpg
│   │   ├── kalam-valley.jpg
│   │   └── swat-river.jpg
│   ├── chitral/
│   │   ├── kalash-valleys.jpg
│   │   ├── chitral-fort.jpg
│   │   └── traditional-festivals.jpg
│   └── peshawar/
│
├── balochistan/
│   ├── quetta/
│   ├── ziarat/
│   ├── hingol/
│   ├── astola-island/
│   └── gwadar/
│
└── azad-kashmir/
    ├── neelum-valley/
    ├── rawalakot/
    └── muzaffarabad/
```

### 3. **Tour-Specific Images**
```
/images/tours/
├── heritage-tours/
├── adventure-tours/
├── cultural-tours/
├── nature-tours/
└── luxury-tours/
```

### 4. **Gallery Images**
```
/images/gallery/
├── landscapes/
├── culture/
├── architecture/
├── people/
└── food/
```

## Image Naming Convention

### Use descriptive, kebab-case names:
- ✅ `badshahi-mosque-sunset.jpg`
- ✅ `hunza-valley-spring.jpg`
- ✅ `k2-base-camp-trek.jpg`
- ❌ `IMG_001.jpg`
- ❌ `photo.jpg`

### Include location and subject:
- `lahore-badshahi-mosque-exterior.jpg`
- `skardu-satpara-lake-dawn.jpg`
- `hunza-apricot-blossoms.jpg`

## Recommended Image Specifications

- **Format**: JPG for photos, PNG for graphics with transparency
- **Resolution**: Minimum 1920x1080 for high-quality display
- **File Size**: Under 500KB each (use compression tools)
- **Aspect Ratio**: 16:9 for landscape, 4:3 for destinations cards

## Integration in Code

### Frontend React Components:
```jsx
// In destination pages
const imagePath = `/images/destinations/gilgit-baltistan/hunza/baltit-fort.jpg`;

// In tour components
const tourImage = `/images/tours/adventure-tours/k2-expedition.jpg`;

// In gallery
const galleryImage = `/images/gallery/landscapes/fairy-meadows-sunset.jpg`;
```

### Backend API (enhanced-tours.json):
```json
{
  "imageUrl": "/images/destinations/punjab/lahore/badshahi-mosque.jpg",
  "gallery": [
    "/images/destinations/punjab/lahore/lahore-fort.jpg",
    "/images/destinations/punjab/lahore/shalimar-gardens.jpg"
  ]
}
```

## Priority Destinations for Images

Based on your current tours, prioritize images for:

1. **Gilgit-Baltistan**: Hunza, Skardu, Fairy Meadows, K2
2. **Punjab**: Lahore, Islamabad, Murree
3. **Sindh**: Karachi
4. **KPK**: Swat, Chitral
5. **Balochistan**: Quetta, Hingol
6. **Azad Kashmir**: Neelum Valley

## Next Steps

1. **Copy your images** to the appropriate folders above
2. **Update tour data** in `backend/data/enhanced-tours.json` to reference local images
3. **Update React components** to use the new image paths
4. **Test image loading** in the browser
5. **Optimize images** for web (compress if needed)

## Example Usage in Components

```jsx
// Destination card component
const DestinationCard = ({ destination }) => (
  <img 
    src={`/images/destinations/${destination.province}/${destination.city}/${destination.slug}.jpg`}
    alt={destination.name}
    className="destination-image"
  />
);

// Tour gallery
const TourGallery = ({ tourSlug, images }) => (
  <div className="gallery">
    {images.map(img => (
      <img src={`/images/tours/${tourSlug}/${img}`} key={img} />
    ))}
  </div>
);
```
