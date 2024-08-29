const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer({ memory: true });
app.use(cors());

// Initialize Google Cloud Storage
const storage = new Storage({
  keyFilename: 'uploadKey.json',
  projectId: 'serious-mini-project',
});

const bucketName = 'serious-mini-project';
const bucket = storage.bucket(bucketName);

app.use(express.json());

// Create a folder
app.post('/api/create-folder', async (req, res) => {
  try {
    const { folderName } = req.body;
    const bucket = storage.bucket(bucketName);
    const folderPath = `${folderName}/`; // Note the trailing slash
    
    // Create an empty object with the folder name as its key
    const file = bucket.file(folderPath);
    await file.save(''); // Save an empty string as content

    res.json({ message: 'Folder created successfully', folderPath });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Upload a file
app.post('/api/upload-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      console.error('Error uploading file:', err);
      res.status(500).json({ error: 'Failed to upload file' });
    });

    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;
      res.json({ message: 'File uploaded successfully', fileUrl: publicUrl });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Upload a folder
app.post('/api/upload-folder', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const folderName = req.body.folderName;
    if (!folderName) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    const uploadPromises = req.files.map(file => {
      const filePath = `${folderName}/${file.originalname}`; // Include the folder name in the file path
      const blob = bucket.file(filePath);
      return blob.save(file.buffer);
    });

    await Promise.all(uploadPromises);

    const folderUrl = `https://storage.googleapis.com/${bucketName}/${folderName}`;
    res.json({ message: 'Folder uploaded successfully', folderUrl });
  } catch (error) {
    console.error('Error uploading folder:', error);
    res.status(500).json({ error: 'Failed to upload folder' });
  }
});

// New function to fetch all files and folders
async function getAllFilesAndFolders() {
  const [files] = await bucket.getFiles();
  const fileSystem = {};

  files.forEach(file => {
    const filePath = file.name.split('/');
    let currentLevel = fileSystem;

    filePath.forEach((part, index) => {
      if (!currentLevel[part]) {
        if (index === filePath.length - 1) {
          // It's a file
          currentLevel[part] = { type: 'file', metadata: file.metadata };
        } else {
          // It's a folder
          currentLevel[part] = { type: 'folder', children: {} };
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
app.get('/api/files-and-folders', async (req, res) => {
  try {
    const fileSystem = await getAllFilesAndFolders();
    res.json(fileSystem);
  } catch (error) {
    console.error('Error fetching files and folders:', error);
    res.status(500).json({ error: 'Failed to fetch files and folders' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});