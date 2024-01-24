
/**
 * Sentinel-2 vegetation index downloading with Google Earth Engine
 * Author: Zhanzhang Cai
 * Email: zhanzhang.cai@nateko.lu.se
 * Date: 2024-01-24
 *
 * Description:
 * This script processes Sentinel-2 imagery within a specified date range and geographical point.
 * It applies cloud masking and calculates various indices including NDVI, EVI, kNDVI, NIRv, NDWI, and NMDI.
 *
 * Usage:
 * - Install Open Earth Engine extension 
 *  (https://chromewebstore.google.com/detail/open-earth-engine-extensi/dhkobehdekjgdahfldleahkekjffibhg?utm_source=ext_app_menu).
 * - Define the point of interest and buffer zone.
 * - Set the date range for filtering the Sentinel-2 collection.
 * - The script adds calculated indices as bands to each image in the collection.
 *
 * Outputs:
 * The script prints the image collection details and exports selected bands of each image in the collection.
 */


// Define the coordinates and buffer zone
var point = ee.Geometry.Point([4.51984,51.30761]).buffer(1000);
var startDate = '2018-07-01';
var endDate = '2018-7-31';
var output_folder = 'test';

Map.addLayer(point,{color: 'yellow'},  "S2_Image");

// This is the Sentinel 2 collection (all the possible available Sentinel-2 imagery)
var S2_collection = ee.ImageCollection("COPERNICUS/S2_SR")
  .filterBounds(point)
  .filterDate(startDate, endDate).map(maskS2clouds); // change date range here
// This tells us what images are inside the collection
print(S2_collection);

var n = S2_collection.size().getInfo();
print(n)
    
var colList = S2_collection.toList(n);
print(colList)

// These are the bands that we want to be displayed
var S2_bands = ['SCL','NDVI','EVI','kNDVI','NIRv','NDWI','NMDI'];
//.double().select(S2_bands).clip(geometry)
var colID = S2_collection.getInfo()['id'] || ""
colID = colID.replace('/','_')

for (var i = 0; i < n; i++) {
  var img = ee.Image(colList.get(i)).double().select(S2_bands).clip(point);
  var id = img.id().getInfo() || colID+'_image_'+i.toString();

  // Select a specific band to get the CRS (e.g., 'B4')
  var selectedBand = img.select('NDVI'); // You can change 'B4' to any other consistent band
  var imageCrs = selectedBand.projection().crs().getInfo();
  
  // Define and start the export task
  var exportTask = Export.image.toDrive({
    image: img,
    description: id,
    crs: imageCrs, // Use the CRS from the selected band
    folder: output_folder,
    fileNamePrefix: id,
    region: point,
    scale: 10
  });
  //print(exportTask)
  //exportTask.start();
}

// Function to mask clouds and calculate indices using the Sentinel-2 QA band.
function maskS2clouds(image) {
  var qa = image.select('QA60');
  var scl = image.select('SCL');
  var B3 = image.select('B3').divide(10000); // Green
  var B4 = image.select('B4').divide(10000); // Red
  var B8 = image.select('B8').divide(10000); // NIR
  var B11 = image.select('B11').divide(10000); // SWIR1
  var B12 = image.select('B12').divide(10000); // SWIR2
  var mask = scl.eq(4).or(scl.eq(5)); 

  // NDVI
  var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');

  // EVI
  var evi = image.expression(
    '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', {
      'NIR': B8,
      'RED': B4,
      'BLUE': B2
    }).rename('EVI');

  // kNDVI
  var sigma = B8.add(B4).multiply(0.5);
  var kndvi = ndvi.expression(
    'exp(-((ndvi * ndvi) / (2 * sigma * sigma)))', {
      'ndvi': ndvi,
      'sigma': sigma
    }).rename('kNDVI');

  // NIRv
  var nirv = ndvi.multiply(B8).rename('NIRv');

  // NDWI
  var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');

  // NMDI
  var nmdi = image.normalizedDifference(['B8', 'B11']).rename('NMDI');

  // Add all the bands to the image
  return image.addBands([ndvi, evi, kndvi, nirv, ndwi, nmdi]).updateMask(mask);
}
