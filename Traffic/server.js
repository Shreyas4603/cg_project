// const express = require('express');
// const fs = require('fs');
// const path = require('path');

import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from "cors"

const app = express();

app.use(cors());

const port = 3001; // Choose a port that suits your needs

// Directory where your images are stored
const imagePath = 'E:/Shreyas Drive/Traffic/Images/';

app.get('/get-images', (req, res) => {
    fs.readdir(imagePath, (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).json({ success: false, message: "Error reading directory" });
            return;
        }

        const imageFiles = files.filter(file => path.extname(file) === '.jpg' || path.extname(file) === '.png'); // Adjust file types as needed

        if (imageFiles.length!== 8) {
            res.status(404).json({ success: false, message: "Expected 8 images, found " + imageFiles.length });
            return;
        }

        const base64Images = imageFiles.map(file => {
            const filePath = path.join(imagePath, file);
            const buffer = fs.readFileSync(filePath);
            return `data:${path.extname(file)};base64,${buffer.toString('base64')}`;
        });

        res.json({ success: true, images: base64Images });
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
