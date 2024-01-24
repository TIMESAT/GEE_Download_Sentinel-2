# GEE_Download_Sentinel-2
GEE tool for downloading Sentinel-2 images

## Description
This project contains a Google Earth Engine script for processing Sentinel-2 satellite imagery. The script filters the Sentinel-2 collection by date and location, applies cloud masking, and calculates several indices: NDVI, EVI, kNDVI, NIRv, NDWI, and NMDI.

## Getting Started

### Dependencies
- Google Earth Engine account
- JavaScript knowledge for script customization

### Installing and Running
1. Copy the script into your Google Earth Engine Code Editor.
2. Customize the `point` variable with the desired coordinates.
3. Set the date range in the `filterDate` function.
4. Run the script in the Code Editor to see the results and export the images.

## Usage
The script can be used for environmental monitoring, agricultural analysis, and land cover change detection by leveraging the calculated vegetation and water indices.

## Contributing
Contributions to the script are welcome. Please fork the repository and open a pull request with your changes.

## Authors
Zhanzhang Cai, Fan Wang

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments
- Google Earth Engine team for the platform
- Sentinel-2 data providers
