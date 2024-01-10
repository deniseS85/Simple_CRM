<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

// Get request data
$postdata = file_get_contents("php://input");

if($postdata != "") {
    // Convert to JSON Array
    $request = json_decode($postdata, TRUE);
    // Get filename from JSON Array
    $fileName = $request["filename"];
    // Remove characters for security reasons
    $fileName = str_replace("..", "", $fileName);
    $fileName = str_replace("/", "", $fileName);
    $fileName = str_replace("\\", "", $fileName);

    // Set folder path
    $imageDirectory = 'uploads/';

    // Set full path to image file
    $imagePath = $imageDirectory . $fileName;

    // Check if file already exists
    if (file_exists($imagePath)) {
        // Delete file
        if (unlink($imagePath)) {
            echo 'Image successfully deleted.';
        } else {
            echo 'Error: Error while deleting the image.';
        }
    } else {
        echo "Error: Image does not exist.";
    }
    

} else {
    echo "Error: No parameter sent.";
}
?>