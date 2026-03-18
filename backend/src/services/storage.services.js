const  ImageKit  = require("@imagekit/nodejs");

const imagekit=new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
})
//why we are using environment variables for ImageKit configuration?
//Using environment variables for ImageKit configuration is a best practice for several reasons:
//1. Security: Storing sensitive information like API keys and secrets in environment variables helps to keep them out of the source code, reducing the risk of accidental exposure if the code is shared or published.
//2. Flexibility: Environment variables allow for different configurations in different environments (development, staging, production) without changing the code. This makes it easier to manage and deploy applications across various environments.
//3. Ease of Management: It simplifies the management of configuration settings, as they can be easily updated without modifying the codebase, which can be especially beneficial in collaborative projects or when using version control systems.

//why file is passed as argument in uploadFile function?
//The file is passed as an argument in the uploadFile function because it contains the actual data of the file that needs to be uploaded to ImageKit. This allows the function to process the file and send it to ImageKit for storage, enabling us to handle file uploads dynamically based on user input or other sources of file data.

//and about buffer?
//When using multer with memoryStorage, the uploaded file is stored in memory as a buffer. This means that instead of saving the file to disk, multer keeps the file data in memory, allowing us to access it directly in our controller. The buffer contains the raw binary data of the file, which can be used to upload the file to ImageKit or any other storage service without needing to read it from disk first. This approach can be more efficient for handling file uploads, especially when we want to process the file immediately after upload without needing to manage temporary files on the server.
async function uploadFileToImageKit(file,fileName){
    // const response=await imagekit.files.upload({
    //     file:file,
    //     fileName:fileName
    // })
    // return response;
    try {
        const base64File = file.toString("base64");

        const result = await imagekit.files.upload({
            file: base64File,
            fileName: fileName
        });

        return result;
    } catch (err) {
        console.error("ImageKit Upload Error:", err);
        throw err;
    }
}
//console.log(require("@imagekit/nodejs"));
//console.log("hehehehe",typeof imagekit.files.upload);
//console.log(imagekit);
module.exports={uploadFileToImageKit};

