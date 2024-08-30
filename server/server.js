const express = require("express");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const cors = require("cors");

const app = express();
const upload = multer({ memory: true });
app.use(cors());

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: "uploadKey.json",
  projectId: "serious-mini-project",
});

const bucketName = "serious-mini-project";
const bucket = storage.bucket(bucketName);

app.use(express.json());

// Create a folder
app.post("/api/create-folder", async (req, res) => {
  try {
    const { folderName } = req.body;
    const bucket = storage.bucket(bucketName);
    const folderPath = `${folderName}/`; // Note the trailing slash

    // Create an empty object with the folder name as its key
    const file = bucket.file(folderPath);
    await file.save(""); // Save an empty string as content

    res.json({ message: "Folder created successfully", folderPath });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "Failed to create folder" });
  }
});

// Upload a file
app.post("/api/upload-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      console.error("Error uploading file:", err);
      res.status(500).json({ error: "Failed to upload file" });
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
      res.json({ message: "File uploaded successfully", fileUrl: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Upload a folder
app.post("/api/upload-folder", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const folderName = req.body.folderName;
    if (!folderName) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const uploadPromises = req.files.map((file) => {
      const filePath = `${folderName}/${file.originalname}`; // Include the folder name in the file path
      const blob = bucket.file(filePath);
      return blob.save(file.buffer);
    });

    await Promise.all(uploadPromises);

    const folderUrl = `https://storage.googleapis.com/${bucketName}/${folderName}`;
    res.json({ message: "Folder uploaded successfully", folderUrl });
  } catch (error) {
    console.error("Error uploading folder:", error);
    res.status(500).json({ error: "Failed to upload folder" });
  }
});

// New function to fetch all files and folders
async function getAllFilesAndFolders() {
  const [files] = await bucket.getFiles();
  const fileSystem = {};

  files.forEach((file) => {
    const filePath = file.name.split("/");
    let currentLevel = fileSystem;

    filePath.forEach((part, index) => {
      if (!currentLevel[part]) {
        if (index === filePath.length - 1) {
          // It's a file
          currentLevel[part] = { type: "file", metadata: file.metadata };
        } else {
          // It's a folder
          currentLevel[part] = { type: "folder", children: {} };
        }
      }
      if (index !== filePath.length - 1) {
        currentLevel = currentLevel[part].children;
      }
    });
  });

  return fileSystem;
}

// New endpoint to get all files and folders
app.get("/api/files-and-folders", async (req, res) => {
  try {
    const fileSystem = await getAllFilesAndFolders();
    res.json(fileSystem);
  } catch (error) {
    console.error("Error fetching files and folders:", error);
    res.status(500).json({ error: "Failed to fetch files and folders" });
  }
});

app.delete("/api/delete-item", async (req, res) => {
  try {
    const { path } = req.body;
    console.log("Received delete request for path:", path);

    if (!path) {
      return res.status(400).json({ error: "Item path is required" });
    }

    // Normalize the path to remove any leading or trailing slashes
    const normalizedPath = path.replace(/^\/+|\/+$/g, "");
    console.log("Normalized path:", normalizedPath);

    // Check if the path exists
    const [files] = await bucket.getFiles({ prefix: normalizedPath });
    console.log("Files found:", files.length);

    if (files.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // If it's a single file, delete it
    if (files.length === 1 && files[0].name === normalizedPath) {
      await bucket.file(normalizedPath).delete();
      console.log("File deleted successfully:", normalizedPath);
      res.json({ message: "File deleted successfully" });
    } else {
      // If it's a folder, delete all files within it
      await Promise.all(
        files.map((file) => {
          console.log("Deleting file:", file.name);
          return file.delete();
        })
      );
      console.log(
        "Folder and its contents deleted successfully:",
        normalizedPath
      );
      res.json({ message: "Folder and its contents deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    res
      .status(500)
      .json({ error: "Failed to delete item", details: error.message });
  }
});

app.post("/api/move-file", async (req, res) => {
  try {
    const { fileName, targetFolder } = req.body;

    if (!fileName || !targetFolder) {
      return res
        .status(400)
        .json({ error: "File name and target folder are required" });
    }

    const file = bucket.file(fileName);
    const newFilePath = path.join(targetFolder, path.basename(fileName));

    await file.move(newFilePath);

    res.json({ success: true, message: "File moved successfully" });
  } catch (error) {
    console.error("Error moving file:", error);
    res.status(500).json({ error: "Failed to move file" });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const [files] = await bucket.getFiles();
    const searchResults = files.filter((file) =>
      file.name.toLowerCase().includes(query.toLowerCase())
    );

    const formattedResults = searchResults.map((file) => ({
      name: file.name,
      type: file.name.endsWith("/") ? "folder" : "file",
      path: file.name,
      // Add more metadata as needed
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error("Error searching files and folders:", error);
    res.status(500).json({ error: "Failed to search files and folders" });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
