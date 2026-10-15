"use strict";

/* =========================================================
   NAOL AI PHOTO STUDIO
   Free Browser-Based Photo Editor
   No API Key Required
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. ELEMENTS
       ===================================================== */

    const $ = (id) => document.getElementById(id);

    const elements = {
        uploadArea: $("uploadArea"),
        uploadContent: $("uploadContent"),
        uploadButton: $("uploadButton"),
        cameraButton: $("cameraButton"),
        fileInput: $("fileInput"),
        cameraInput: $("cameraInput"),

        imageWorkspace: $("imageWorkspace"),
        photoCanvas: $("photoCanvas"),
        fileName: $("fileName"),
        imageDimensions: $("imageDimensions"),
        imageSize: $("imageSize"),

        changePhotoButton: $("changePhotoButton"),

        cameraPanel: $("cameraPanel"),
        cameraVideo: $("cameraVideo"),
        closeCameraButton: $("closeCameraButton"),
        captureButton: $("captureButton"),
        switchCameraButton: $("switchCameraButton"),
        cameraMessage: $("cameraMessage"),

        editingPanel: $("editingPanel"),

        autoEnhanceButton: $("autoEnhanceButton"),
        sharpenButton: $("sharpenButton"),
        cinematicButton: $("cinematicButton"),
        resetButton: $("resetButton"),
        resetAdjustmentsButton: $("resetAdjustmentsButton"),

        brightnessSlider: $("brightnessSlider"),
        contrastSlider: $("contrastSlider"),
        saturationSlider: $("saturationSlider"),
        sharpnessSlider: $("sharpnessSlider"),
        warmthSlider: $("warmthSlider"),

        brightnessValue: $("brightnessValue"),
        contrastValue: $("contrastValue"),
        saturationValue: $("saturationValue"),
        sharpnessValue: $("sharpnessValue"),
        warmthValue: $("warmthValue"),

        comparisonSlider: $("comparisonSlider"),

        downloadButton: $("downloadButton"),
        exportFormat: $("exportFormat"),
        exportQuality: $("exportQuality"),

        processingPanel: $("processingPanel"),
        processingTitle: $("processingTitle"),
        processingMessage: $("processingMessage"),
        processingPercent: $("processingPercent"),
        progressBar: $("progressBar"),

        previewLoading: $("previewLoading"),
        imagePlaceholder: $("imagePlaceholder"),

        toast: $("toast"),
        themeButton: $("themeButton"),
        currentYear: $("currentYear")
    };


    /* =====================================================
       2. STATE
       ===================================================== */

    const canvas = elements.photoCanvas;
    const ctx = canvas.getContext("2d", {
        willReadFrequently: true
    });

    const originalCanvas = document.createElement("canvas");
    const originalCtx = originalCanvas.getContext("2d", {
        willReadFrequently: true
    });

    const workCanvas = document.createElement("canvas");
    const workCtx = workCanvas.getContext("2d", {
        willReadFrequently: true
    });

    const sharpCanvas = document.createElement("canvas");
    const sharpCtx = sharpCanvas.getContext("2d", {
        willReadFrequently: true
    });

    const state = {
        hasImage: false,
        originalImage: null,
        fileName: "naol-photo",
        originalFileSize: 0,

        width: 0,
        height: 0,

        objectUrl: null,
        cameraStream: null,
        cameraFacingMode: "environment",

        settings: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            sharpness: 0,
            warmth: 0
        },

        preset: "original",

        comparison: 100,

        renderTimer: null,
        renderToken: 0,
        toastTimer: null,
        isRendering: false
    };


    /* =====================================================
       3. CONSTANTS
       ===================================================== */

    const MAX_IMAGE_DIMENSION = 2400;

    const MAX_INPUT_PIXELS = 40_000_000;

    const MAX_PREVIEW_PIXELS = 8_000_000;

    const MAX_SHARPEN_PIXELS = 2_500_000;

    const MAX_EXPORT_PIXELS = 16_000_000;

    const MAX_FILE_SIZE = 30 * 1024 * 1024;

    const ACCEPTED_TYPES = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    const SLIDERS = {
        brightness: elements.brightnessSlider,
        contrast: elements.contrastSlider,
        saturation: elements.saturationSlider,
        sharpness: elements.sharpnessSlider,
        warmth: elements.warmthSlider
    };

    const OUTPUTS = {
        brightness: elements.brightnessValue,
        contrast: elements.contrastValue,
        saturation: elements.saturationValue,
        sharpness: elements.sharpnessValue,
        warmth: elements.warmthValue
    };


    /* =====================================================
       4. PRESETS
       ===================================================== */

    const PRESETS = {

        original: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            sharpness: 0,
            warmth: 0
        },

        cinematic: {
            brightness: 3,
            contrast: 16,
            saturation: 9,
            sharpness: 24,
            warmth: 7
        },

        portrait: {
            brightness: 7,
            contrast: 5,
            saturation: 4,
            sharpness: 12,
            warmth: 8
        },

        natural: {
            brightness: 3,
            contrast: 4,
            saturation: 5,
            sharpness: 12,
            warmth: 2
        },

        dark: {
            brightness: -7,
            contrast: 22,
            saturation: -9,
            sharpness: 18,
            warmth: -5
        },

        vibrant: {
            brightness: 4,
            contrast: 10,
            saturation: 24,
            sharpness: 18,
            warmth: 2
        },

        warm: {
            brightness: 4,
            contrast: 8,
            saturation: 10,
            sharpness: 14,
            warmth: 19
        }

    };


    /* =====================================================
       5. INITIALIZATION
       ===================================================== */

    function initialize() {

        elements.currentYear.textContent =
            new Date().getFullYear();

        elements.uploadArea.setAttribute(
            "aria-disabled",
            "false"
        );

        setEditingEnabled(false);

        updateSliderOutputs();

        bindEvents();

    }


    /* =====================================================
       6. EVENT LISTENERS
       ===================================================== */

    function bindEvents() {

        elements.uploadButton.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();
                elements.fileInput.click();
            }
        );

        elements.changePhotoButton.addEventListener(
            "click",
            () => elements.fileInput.click()
        );

        elements.fileInput.addEventListener(
            "change",
            (event) => {
                const file = event.target.files?.[0];

                if (file) {
                    loadPhoto(file);
                }

                event.target.value = "";
            }
        );

        elements.cameraInput.addEventListener(
            "change",
            (event) => {
                const file = event.target.files?.[0];

                if (file) {
                    loadPhoto(file);
                }

                event.target.value = "";
            }
        );

        elements.cameraButton.addEventListener(
            "click",
            openCamera
        );

        elements.closeCameraButton.addEventListener(
            "click",
            stopCamera
        );

        elements.captureButton.addEventListener(
            "click",
            capturePhoto
        );

        elements.switchCameraButton.addEventListener(
            "click",
            switchCamera
        );

        elements.autoEnhanceButton.addEventListener(
            "click",
            autoEnhance
        );

        elements.sharpenButton.addEventListener(
            "click",
            sharpenPhoto
        );

        elements.cinematicButton.addEventListener(
            "click",
            applyCinematic
        );

        elements.resetButton.addEventListener(
            "click",
            resetPhoto
        );

        elements.resetAdjustmentsButton.addEventListener(
            "click",
            resetAdjustments
        );

        elements.downloadButton.addEventListener(
            "click",
            downloadPhoto
        );

        elements.comparisonSlider.addEventListener(
            "input",
            () => {
                state.comparison =
                    Number(elements.comparisonSlider.value);

                drawComparison();
            }
        );

        Object.entries(SLIDERS).forEach(
            ([name, slider]) => {

                slider.addEventListener("input", () => {

                    state.settings[name] =
                        Number(slider.value);

                    state.preset = "custom";

                    updateSliderOutputs();
                    updateActivePreset();

                    scheduleRender();

                });

            }
        );

        document.querySelectorAll("[data-preset]").forEach(
            (button) => {

                button.addEventListener("click", () => {

                    const presetName =
                        button.dataset.preset;

                    applyPreset(presetName);

                });

            }
        );

        elements.themeButton.addEventListener(
            "click",
            toggleTheme
        );

        setupDragAndDrop();

        setupKeyboardAccessibility();

        window.addEventListener("beforeunload", () => {
            stopCamera();
            revokeObjectUrl();
        });

    }


    /* =====================================================
       7. DRAG AND DROP
       ===================================================== */

    function setupDragAndDrop() {

        const area = elements.uploadArea;

        area.addEventListener("click", (event) => {

            if (
                event.target.closest("button") ||
                event.target.closest("canvas") ||
                event.target.closest("video")
            ) {
                return;
            }

            if (!state.hasImage) {
                elements.fileInput.click();
            }

        });

        area.addEventListener("keydown", (event) => {

            if (
                event.target !== area ||
                state.hasImage
            ) {
                return;
            }

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                elements.fileInput.click();
            }

        });

        ["dragenter", "dragover"].forEach((name) => {

            area.addEventListener(name, (event) => {

                event.preventDefault();

                area.classList.add("drag-over");

            });

        });

        ["dragleave", "drop"].forEach((name) => {

            area.addEventListener(name, (event) => {

                event.preventDefault();

                area.classList.remove("drag-over");

            });

        });

        area.addEventListener("drop", (event) => {

            const file = event.dataTransfer?.files?.[0];

            if (file) {
                loadPhoto(file);
            }

        });

        document.addEventListener("dragover", (event) => {
            event.preventDefault();
        });

        document.addEventListener("drop", (event) => {
            event.preventDefault();
        });

    }


    /* =====================================================
       8. KEYBOARD ACCESSIBILITY
       ===================================================== */

    function setupKeyboardAccessibility() {

        document.addEventListener("keydown", (event) => {

            if (
                event.key === "Escape" &&
                !elements.cameraPanel.classList.contains("hidden")
            ) {
                stopCamera();
            }

        });

    }


    /* =====================================================
       9. FILE VALIDATION
       ===================================================== */

    function validateFile(file) {

        if (!file) {
            return false;
        }

        if (!ACCEPTED_TYPES.includes(file.type)) {

            showToast(
                "Please select a JPG, PNG or WebP image."
            );

            return false;

        }

        if (file.size > MAX_FILE_SIZE) {

            showToast(
                "Image is too large. Maximum file size is 30 MB."
            );

            return false;

        }

        return true;

    }


    /* =====================================================
       10. LOAD PHOTO
       ===================================================== */

    async function loadPhoto(file) {

        if (!validateFile(file)) {
            return;
        }

        stopCamera();

        showLoading(true);

        try {

            const image = await decodeImage(file);

            const sourceWidth =
                image.naturalWidth || image.width;

            const sourceHeight =
                image.naturalHeight || image.height;

            if (
                !sourceWidth ||
                !sourceHeight ||
                !Number.isFinite(sourceWidth) ||
                !Number.isFinite(sourceHeight)
            ) {
                throw new Error("Invalid image dimensions.");
            }

            if (
                sourceWidth * sourceHeight >
                MAX_INPUT_PIXELS
            ) {
                throw new Error(
                    "Image resolution is too large for this device."
                );
            }

            state.originalImage = image;

            state.originalFileSize = file.size;

            state.fileName = file.name.replace(
                /\.[^/.]+$/,
                ""
            ) || "naol-photo";

            const scale = Math.min(
                1,
                MAX_IMAGE_DIMENSION / sourceWidth,
                MAX_IMAGE_DIMENSION / sourceHeight,
                Math.sqrt(
                    MAX_PREVIEW_PIXELS /
                    (sourceWidth * sourceHeight)
                )
            );

            state.width = Math.max(
                1,
                Math.round(sourceWidth * scale)
            );

            state.height = Math.max(
                1,
                Math.round(sourceHeight * scale)
            );

            prepareCanvas(
                originalCanvas,
                state.width,
                state.height
            );

            originalCtx.drawImage(
                image,
                0,
                0,
                state.width,
                state.height
            );

            prepareCanvas(
                canvas,
                state.width,
                state.height
            );

            state.hasImage = true;

            resetSettingsWithoutRender();

            drawOriginal();

            elements.uploadContent.classList.add("hidden");

            elements.imageWorkspace.classList.remove("hidden");

            elements.uploadArea.classList.remove("drag-over");

            elements.fileName.textContent = file.name;

            elements.imageDimensions.textContent =
                `${sourceWidth} × ${sourceHeight}` +
                (
                    scale < 1
                        ? " · Optimized preview"
                        : ""
                );

            elements.imageSize.textContent =
                formatBytes(file.size);

            elements.comparisonSlider.value = "100";

            state.comparison = 100;

            setEditingEnabled(true);

            elements.editingPanel.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

            showToast(
                "Photo loaded successfully. Start editing!"
            );

        } catch (error) {

            console.error("Photo loading error:", error);

            showToast(
                error.message ||
                "Could not load this image."
            );

        } finally {

            showLoading(false);

        }

    }


    /* =====================================================
       11. IMAGE DECODING
       ===================================================== */

    function decodeImage(file) {

        return new Promise((resolve, reject) => {

            const url = URL.createObjectURL(file);

            const image = new Image();

            image.onload = () => {

                URL.revokeObjectURL(url);

                resolve(image);

            };

            image.onerror = () => {

                URL.revokeObjectURL(url);

                reject(
                    new Error(
                        "Unable to read this image."
                    )
                );

            };

            image.src = url;

        });

    }


    /* =====================================================
       12. CANVAS UTILITIES
       ===================================================== */

    function prepareCanvas(targetCanvas, width, height) {

        targetCanvas.width = width;
        targetCanvas.height = height;

    }


    function drawOriginal() {

        if (!state.hasImage) {
            return;
        }

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.drawImage(
            originalCanvas,
            0,
            0
        );

        drawComparison();

    }


    function drawComparison() {

        if (!state.hasImage) {
            return;
        }

        const ratio = Math.max(
            0,
            Math.min(100, state.comparison)
        ) / 100;

        if (ratio >= 1) {

            renderCurrentImage();

            return;

        }

        if (ratio <= 0) {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            ctx.drawImage(
                originalCanvas,
                0,
                0
            );

            return;

        }

        renderCurrentImage();

        const split = Math.round(
            canvas.width * ratio
        );

        ctx.save();

        ctx.beginPath();

        ctx.rect(
            split,
            0,
            canvas.width - split,
            canvas.height
        );

        ctx.clip();

        ctx.clearRect(
            split,
            0,
            canvas.width - split,
            canvas.height
        );

        ctx.drawImage(
            originalCanvas,
            0,
            0
        );

        ctx.restore();

        ctx.save();

        ctx.strokeStyle = "#ffffff";

        ctx.lineWidth = Math.max(
            1,
            canvas.width / 800
        );

        ctx.beginPath();

        ctx.moveTo(
            split,
            0
        );

        ctx.lineTo(
            split,
            canvas.height
        );

        ctx.stroke();

        ctx.restore();

    }


    function renderCurrentImage() {

        if (!state.hasImage) {
            return;
        }

        const settings = state.settings;

        const preset = getPresetAdjustments();

        const brightness =
            settings.brightness + preset.brightness;

        const contrast =
            settings.contrast + preset.contrast;

        const saturation =
            settings.saturation + preset.saturation;

        const warmth =
            settings.warmth + preset.warmth;

        const sharpness =
            Math.max(
                settings.sharpness,
                preset.sharpness
            );

        const brightnessCSS = brightness * 0.65;

        const contrastCSS =
            1 + contrast / 100;

        const saturationCSS =
            Math.max(
                0,
                1 + saturation / 100
            );

        const warmthCSS = Math.max(
            0,
            Math.min(
                1,
                (warmth + 100) / 200
            )
        );

        ctx.save();

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.filter = [
            `brightness(${100 + brightnessCSS}%)`,
            `contrast(${contrastCSS * 100}%)`,
            `saturate(${saturationCSS * 100}%)`
        ].join(" ");

        ctx.drawImage(
            originalCanvas,
            0,
            0
        );

        ctx.restore();

        applyWarmth(warmth);

        if (sharpness > 0) {
            applySharpen(sharpness);
        }

        /*
         * Comparison preview always shows the original image
         * on the left and the edited image on the right.
         */

        if (state.comparison < 100) {
            drawComparisonOverlay();
        }

    }


    /* =====================================================
       13. PRESET ADJUSTMENTS
       ===================================================== */

    function getPresetAdjustments() {

        if (
            !state.preset ||
            state.preset === "original" ||
            state.preset === "custom" ||
            !PRESETS[state.preset]
        ) {

            return {
                brightness: 0,
                contrast: 0,
                saturation: 0,
                sharpness: 0,
                warmth: 0
            };

        }

        return {
            ...PRESETS[state.preset]
        };

    }


    function drawComparisonOverlay() {

        const ratio = Math.max(
            0,
            Math.min(100, state.comparison)
        ) / 100;

        const split = Math.round(
            canvas.width * ratio
        );

        ctx.save();

        ctx.beginPath();

        ctx.rect(
            split,
            0,
            canvas.width - split,
            canvas.height
        );

        ctx.clip();

        ctx.clearRect(
            split,
            0,
            canvas.width - split,
            canvas.height
        );

        ctx.drawImage(
            originalCanvas,
            0,
            0
        );

        ctx.restore();

    }


    /* =====================================================
       14. WARMTH FILTER
       ===================================================== */

    function applyWarmth(amount) {

        if (!amount) {
            return;
        }

        const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const data = imageData.data;

        const strength = amount * 0.24;

        for (let i = 0; i < data.length; i += 4) {

            const red = data[i];

            const green = data[i + 1];

            const blue = data[i + 2];

            data[i] = clamp(
                red + strength
            );

            data[i + 1] = clamp(
                green + strength * 0.12
            );

            data[i + 2] = clamp(
                blue - strength * 0.65
            );

        }

        ctx.putImageData(
            imageData,
            0,
            0
        );

    }


    /* =====================================================
       15. SHARPEN FILTER
       ===================================================== */

    function applySharpen(amount) {

        const pixelCount =
            canvas.width * canvas.height;

        if (
            pixelCount >
            MAX_SHARPEN_PIXELS
        ) {

            /*
             * Avoid expensive pixel processing on large
             * images and slower mobile devices.
             */

            return;

        }

        const strength = Math.min(
            0.75,
            amount / 100 * 0.75
        );

        if (strength <= 0) {
            return;
        }

        const source = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const sourceData = source.data;

        const width = canvas.width;
        const height = canvas.height;

        const output = sharpCtx.createImageData(
            width,
            height
        );

        const outputData = output.data;

        outputData.set(sourceData);

        for (
            let y = 1;
            y < height - 1;
            y++
        ) {

            for (
                let x = 1;
                x < width - 1;
                x++
            ) {

                const i = (
                    y * width + x
                ) * 4;

                const up = i - width * 4;

                const down = i + width * 4;

                const left = i - 4;

                const right = i + 4;

                for (
                    let channel = 0;
                    channel < 3;
                    channel++
                ) {

                    const center =
                        sourceData[i + channel];

                    const neighbors = (
                        sourceData[up + channel] +
                        sourceData[down + channel] +
                        sourceData[left + channel] +
                        sourceData[right + channel]
                    ) / 4;

                    outputData[i + channel] = clamp(
                        center +
                        (center - neighbors) * strength
                    );

                }

            }

        }

        sharpCtx.putImageData(
            output,
            0,
            0
        );

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        ctx.drawImage(
            sharpCanvas,
            0,
            0
        );

    }


    /* =====================================================
       16. SCHEDULED RENDERING
       ===================================================== */

    function scheduleRender() {

        if (!state.hasImage) {
            return;
        }

        clearTimeout(state.renderTimer);

        state.renderToken++;

        state.renderTimer = setTimeout(() => {

            renderPhoto();

        }, 35);

    }


    function renderPhoto() {

        if (!state.hasImage) {
            return;
        }

        if (state.isRendering) {
            return;
        }

        state.isRendering = true;

        try {

            renderCurrentImage();

        } catch (error) {

            console.error(
                "Rendering error:",
                error
            );

            showToast(
                "Editing failed. Try a smaller image."
            );

        } finally {

            state.isRendering = false;

        }

    }


    /* =====================================================
       17. AUTO ENHANCE
       ===================================================== */

    async function autoEnhance() {

        if (!requireImage()) {
            return;
        }

        showProcessing(
            true,
            "Enhancing your photo...",
            "Applying balanced contrast, color and sharpening."
        );

        setEditingEnabled(false);

        try {

            await yieldToBrowser();

            state.preset = "original";

            state.settings = {
                brightness: 4,
                contrast: 12,
                saturation: 9,
                sharpness: 22,
                warmth: 3
            };

            syncSliders();

            renderCurrentImage();

            await yieldToBrowser();

            updateActivePreset();

            showToast(
                "Auto Enhance completed successfully!"
            );

        } catch (error) {

            console.error(
                "Auto Enhance error:",
                error
            );

            showToast(
                "Could not enhance this photo."
            );

        } finally {

            showProcessing(false);

            setEditingEnabled(true);

        }

    }


    /* =====================================================
       18. ULTRA SHARP
       ===================================================== */

    async function sharpenPhoto() {

        if (!requireImage()) {
            return;
        }

        showProcessing(
            true,
            "Sharpening image...",
            "Improving the appearance of fine edges."
        );

        setEditingEnabled(false);

        try {

            await yieldToBrowser();

            state.settings.sharpness = 55;

            state.preset = "original";

            syncSliders();

            renderCurrentImage();

            await yieldToBrowser();

            showToast(
                "Sharpening applied."
            );

        } catch (error) {

            console.error(
                "Sharpening error:",
                error
            );

            showToast(
                "Sharpening failed. Try a smaller photo."
            );

        } finally {

            showProcessing(false);

            setEditingEnabled(true);

        }

    }


    /* =====================================================
       19. CINEMATIC MODE
       ===================================================== */

    async function applyCinematic() {

        applyPreset("cinematic");

        showToast(
            "Cinematic color grading applied."
        );

    }


    /* =====================================================
       20. APPLY PRESET
       ===================================================== */

    async function applyPreset(name) {

        if (!requireImage()) {
            return;
        }

        if (!PRESETS[name]) {
            return;
        }

        state.preset = name;

        state.settings = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            sharpness: 0,
            warmth: 0
        };

        syncSliders();

        updateActivePreset();

        showProcessing(
            true,
            "Applying preset...",
            "Updating colors and image appearance."
        );

        setEditingEnabled(false);

        try {

            await yieldToBrowser();

            renderCurrentImage();

            await yieldToBrowser();

            showToast(
                `${getPresetName(name)} applied successfully.`
            );

        } catch (error) {

            console.error(
                "Preset error:",
                error
            );

            showToast(
                "Unable to apply this preset."
            );

        } finally {

            showProcessing(false);

            setEditingEnabled(true);

        }

    }


    function getPresetName(name) {

        const names = {
            original: "Original",
            cinematic: "Cinematic Pro",
            portrait: "Portrait Pro",
            natural: "Natural Beauty",
            dark: "Dark Cinematic",
            vibrant: "Vibrant Color",
            warm: "Warm Film"
        };

        return names[name] || "Preset";

    }


    /* =====================================================
       21. RESET
       ===================================================== */

    function resetSettingsWithoutRender() {

        state.settings = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            sharpness: 0,
            warmth: 0
        };

        state.preset = "original";

        state.comparison = 100;

        syncSliders();

        updateActivePreset();

    }


    function resetPhoto() {

        if (!requireImage()) {
            return;
        }

        resetSettingsWithoutRender();

        renderCurrentImage();

        elements.comparisonSlider.value = "100";

        showToast(
            "Photo restored to original settings."
        );

    }


    function resetAdjustments() {

        if (!requireImage()) {
            return;
        }

        state.settings = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            sharpness: 0,
            warmth: 0
        };

        state.preset = "original";

        syncSliders();

        updateActivePreset();

        renderCurrentImage();

        showToast(
            "Adjustments reset."
        );

    }


    /* =====================================================
       22. SLIDER OUTPUTS
       ===================================================== */

    function syncSliders() {

        Object.keys(SLIDERS).forEach((name) => {

            SLIDERS[name].value =
                String(state.settings[name]);

        });

        updateSliderOutputs();

    }


    function updateSliderOutputs() {

        Object.keys(OUTPUTS).forEach((name) => {

            OUTPUTS[name].textContent =
                String(state.settings[name]);

        });

    }


    function updateActivePreset() {

        document.querySelectorAll(
            "[data-preset]"
        ).forEach((button) => {

            button.classList.toggle(
                "active",
                button.dataset.preset === state.preset
            );

        });

    }


    /* =====================================================
       23. EDITOR ENABLE / DISABLE
       ===================================================== */

    function setEditingEnabled(enabled) {

        const controls = [
            elements.autoEnhanceButton,
            elements.sharpenButton,
            elements.cinematicButton,
            elements.resetButton,
            elements.resetAdjustmentsButton,
            elements.comparisonSlider,
            elements.downloadButton,
            elements.exportFormat,
            elements.exportQuality,

            ...Object.values(SLIDERS)
        ];

        controls.forEach((control) => {

            control.disabled = !enabled;

        });

        document.querySelectorAll(
            "[data-preset]"
        ).forEach((button) => {

            button.disabled = !enabled;

        });

    }


    /* =====================================================
       24. CAMERA
       ===================================================== */

    async function openCamera() {

        if (!navigator.mediaDevices?.getUserMedia) {

            showToast(
                "Live camera requires HTTPS and browser camera support. Try Open Camera again."
            );

            /*
             * On mobile, allow the browser's native camera
             * picker as a fallback.
             */

            elements.cameraInput.click();

            return;

        }

        stopCamera();

        elements.cameraPanel.classList.remove("hidden");

        elements.cameraMessage.textContent =
            "Requesting camera permission...";

        try {

            state.cameraStream =
                await navigator.mediaDevices.getUserMedia({
                    audio: false,

                    video: {
                        facingMode: {
                            ideal: state.cameraFacingMode
                        },

                        width: {
                            ideal: 1920
                        },

                        height: {
                            ideal: 1080
                        }
                    }
                });

            elements.cameraVideo.srcObject =
                state.cameraStream;

            await elements.cameraVideo.play();

            elements.cameraMessage.textContent =
                "Camera ready. Capture your photo.";

        } catch (error) {

            console.error(
                "Camera error:",
                error
            );

            stopCamera();

            elements.cameraMessage.textContent =
                "Camera permission was unavailable. Try the native camera picker.";

            showToast(
                "Camera unavailable. Opening your device camera options."
            );

            elements.cameraInput.click();

        }

    }


    function stopCamera() {

        if (state.cameraStream) {

            state.cameraStream
                .getTracks()
                .forEach((track) => track.stop());

            state.cameraStream = null;

        }

        elements.cameraVideo.srcObject = null;

        elements.cameraPanel.classList.add("hidden");

    }


    async function switchCamera() {

        if (!state.cameraStream) {
            return;
        }

        state.cameraFacingMode =
            state.cameraFacingMode === "environment"
                ? "user"
                : "environment";

        await openCamera();

    }


    async function capturePhoto() {

        const video = elements.cameraVideo;

        if (
            !video.videoWidth ||
            !video.videoHeight
        ) {

            showToast(
                "Please wait until the camera is ready."
            );

            return;

        }

        const captureCanvas =
            document.createElement("canvas");

        captureCanvas.width = video.videoWidth;

        captureCanvas.height = video.videoHeight;

        const captureCtx =
            captureCanvas.getContext("2d");

        captureCtx.drawImage(
            video,
            0,
            0,
            captureCanvas.width,
            captureCanvas.height
        );

        captureCanvas.toBlob(
            async (blob) => {

                if (!blob) {

                    showToast(
                        "Could not capture this photo."
                    );

                    return;

                }

                const file = new File(
                    [blob],
                    `naol-camera-${Date.now()}.jpg`,
                    {
                        type: "image/jpeg"
                    }
                );

                stopCamera();

                await loadPhoto(file);

            },
            "image/jpeg",
            0.95
        );

    }


    /* =====================================================
       25. DOWNLOAD
       ===================================================== */

    async function downloadPhoto() {

        if (!requireImage()) {
            return;
        }

        const format =
            elements.exportFormat.value;

        const quality = Math.max(
            0.1,
            Math.min(
                1,
                Number(elements.exportQuality.value) || 0.95
            )
        );

        showProcessing(
            true,
            "Exporting your photo...",
            "Preparing the edited image for download."
        );

        setEditingEnabled(false);

        try {

            await yieldToBrowser();

            const outputCanvas =
                await createExportCanvas();

            const blob = await canvasToBlob(
                outputCanvas,
                format,
                quality
            );

            const extension =
                format === "image/png"
                    ? "png"
                    : format === "image/webp"
                        ? "webp"
                        : "jpg";

            const filename =
                `${sanitizeFilename(state.fileName)}-naol-edited.${extension}`;

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;

            link.download = filename;

            document.body.appendChild(link);

            link.click();

            link.remove();

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 3000);

            showToast(
                "Your edited photo has been downloaded."
            );

        } catch (error) {

            console.error(
                "Download error:",
                error
            );

            showToast(
                error.message ||
                "Could not export this photo. Try a smaller image."
            );

        } finally {

            showProcessing(false);

            setEditingEnabled(true);

        }

    }


    async function createExportCanvas() {

        const sourceWidth =
            originalCanvas.width;

        const sourceHeight =
            originalCanvas.height;

        const scale = Math.min(
            1,
            Math.sqrt(
                MAX_EXPORT_PIXELS /
                (sourceWidth * sourceHeight)
            )
        );

        const exportWidth = Math.max(
            1,
            Math.round(sourceWidth * scale)
        );

        const exportHeight = Math.max(
            1,
            Math.round(sourceHeight * scale)
        );

        const exportCanvas =
            document.createElement("canvas");

        exportCanvas.width = exportWidth;

        exportCanvas.height = exportHeight;

        const exportCtx =
            exportCanvas.getContext("2d", {
                willReadFrequently: true
            });

        exportCtx.drawImage(
            originalCanvas,
            0,
            0,
            exportWidth,
            exportHeight
        );

        const settings = state.settings;

        const preset = getPresetAdjustments();

        const brightness =
            settings.brightness + preset.brightness;

        const contrast =
            settings.contrast + preset.contrast;

        const saturation =
            settings.saturation + preset.saturation;

        const warmth =
            settings.warmth + preset.warmth;

        const sharpness = Math.max(
            settings.sharpness,
            preset.sharpness
        );

        const brightnessCSS =
            brightness * 0.65;

        const contrastCSS =
            1 + contrast / 100;

        const saturationCSS = Math.max(
            0,
            1 + saturation / 100
        );

        const tempCanvas =
            document.createElement("canvas");

        tempCanvas.width = exportWidth;

        tempCanvas.height = exportHeight;

        const tempCtx =
            tempCanvas.getContext("2d", {
                willReadFrequently: true
            });

        tempCtx.filter = [
            `brightness(${100 + brightnessCSS}%)`,
            `contrast(${contrastCSS * 100}%)`,
            `saturate(${saturationCSS * 100}%)`
        ].join(" ");

        tempCtx.drawImage(
            exportCanvas,
            0,
            0
        );

        exportCtx.clearRect(
            0,
            0,
            exportWidth,
            exportHeight
        );

        exportCtx.filter = "none";

        exportCtx.drawImage(
            tempCanvas,
            0,
            0
        );

        if (warmth !== 0) {

            const imageData =
                exportCtx.getImageData(
                    0,
                    0,
                    exportWidth,
                    exportHeight
                );

            const data = imageData.data;

            const strength = warmth * 0.24;

            for (
                let i = 0;
                i < data.length;
                i += 4
            ) {

                data[i] = clamp(
                    data[i] + strength
                );

                data[i + 1] = clamp(
                    data[i + 1] + strength * 0.12
                );

                data[i + 2] = clamp(
                    data[i + 2] - strength * 0.65
                );

            }

            exportCtx.putImageData(
                imageData,
                0,
                0
            );

        }

        if (sharpness > 0) {

            const pixelCount =
                exportWidth * exportHeight;

            if (
                pixelCount <= MAX_SHARPEN_PIXELS
            ) {

                applySharpenToCanvas(
                    exportCanvas,
                    exportCtx,
                    sharpness
                );

            }

        }

        return exportCanvas;

    }


    function applySharpenToCanvas(
        targetCanvas,
        targetCtx,
        amount
    ) {

        const width = targetCanvas.width;

        const height = targetCanvas.height;

        const strength = Math.min(
            0.75,
            amount / 100 * 0.75
        );

        if (!strength) {
            return;
        }

        const source = targetCtx.getImageData(
            0,
            0,
            width,
            height
        );

        const sourceData = source.data;

        const output = targetCtx.createImageData(
            width,
            height
        );

        const outputData = output.data;

        outputData.set(sourceData);

        for (let y = 1; y < height - 1; y++) {

            for (let x = 1; x < width - 1; x++) {

                const i = (
                    y * width + x
                ) * 4;

                const up = i - width * 4;

                const down = i + width * 4;

                const left = i - 4;

                const right = i + 4;

                for (
                    let channel = 0;
                    channel < 3;
                    channel++
                ) {

                    const center =
                        sourceData[i + channel];

                    const neighbors = (
                        sourceData[up + channel] +
                        sourceData[down + channel] +
                        sourceData[left + channel] +
                        sourceData[right + channel]
                    ) / 4;

                    outputData[i + channel] = clamp(
                        center +
                        (center - neighbors) * strength
                    );

                }

            }

        }

        targetCtx.putImageData(
            output,
            0,
            0
        );

    }


    function canvasToBlob(
        targetCanvas,
        format,
        quality
    ) {

        return new Promise((resolve, reject) => {

            targetCanvas.toBlob(
                (blob) => {

                    if (!blob) {

                        reject(
                            new Error(
                                "The browser could not create the image file."
                            )
                        );

                        return;

                    }

                    /*
                     * If the browser cannot export WebP,
                     * it may return PNG. Report the actual
                     * format to the user instead of silently
                     * pretending it is the requested format.
                     */

                    if (
                        format === "image/webp" &&
                        blob.type !== "image/webp"
                    ) {

                        reject(
                            new Error(
                                "WebP export is not supported by this browser. Choose JPG or PNG."
                            )
                        );

                        return;

                    }

                    resolve(blob);

                },
                format,
                quality
            );

        });

    }


    function sanitizeFilename(name) {

        return String(name || "naol-photo")
            .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
            .replace(/\s+/g, "-")
            .slice(0, 100) || "naol-photo";

    }


    /* =====================================================
       26. THEME
       ===================================================== */

    function toggleTheme() {

        document.body.classList.toggle(
            "light-theme"
        );

        const isLight =
            document.body.classList.contains(
                "light-theme"
            );

        elements.themeButton.textContent =
            isLight ? "☀" : "◐";

        showToast(
            isLight
                ? "Light theme enabled."
                : "Dark theme enabled."
        );

    }


    /* =====================================================
       27. PROCESSING STATUS
       ===================================================== */

    function showProcessing(
        visible,
        title = "Processing...",
        message = "Please wait."
    ) {

        elements.processingPanel.classList.toggle(
            "hidden",
            !visible
        );

        if (!visible) {
            return;
        }

        elements.processingTitle.textContent =
            title;

        elements.processingMessage.textContent =
            message;

        elements.processingPercent.textContent =
            "0%";

        elements.progressBar.style.width =
            "0%";

        /*
         * This is a visual progress indicator, not a
         * measurement of actual CPU processing.
         */

        let progress = 0;

        const startedAt = Date.now();

        const timer = setInterval(() => {

            if (
                elements.processingPanel.classList.contains(
                    "hidden"
                )
            ) {

                clearInterval(timer);

                return;

            }

            progress = Math.min(
                90,
                Math.floor(
                    (Date.now() - startedAt) / 30
                )
            );

            elements.processingPercent.textContent =
                `${progress}%`;

            elements.progressBar.style.width =
                `${progress}%`;

        }, 50);

        /*
         * The actual operation's finally block hides the
         * panel. Keep the timer bounded to avoid background
         * work after long operations.
         */

        setTimeout(() => {
            clearInterval(timer);
        }, 30000);

    }


    function showLoading(visible) {

        elements.previewLoading.classList.toggle(
            "hidden",
            !visible
        );

    }


    /* =====================================================
       28. TOAST
       ===================================================== */

    function showToast(message) {

        clearTimeout(state.toastTimer);

        elements.toast.textContent = message;

        elements.toast.classList.remove("hidden");

        state.toastTimer = setTimeout(() => {

            elements.toast.classList.add("hidden");

        }, 3500);

    }


    /* =====================================================
       29. UTILITIES
       ===================================================== */

    function requireImage() {

        if (!state.hasImage) {

            showToast(
                "Please upload a photo first."
            );

            return false;

        }

        return true;

    }


    function clamp(value) {

        return Math.max(
            0,
            Math.min(255, Math.round(value))
        );

    }


    function formatBytes(bytes) {

        if (!Number.isFinite(bytes) || bytes < 0) {
            return "Unknown size";
        }

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

    }


    function yieldToBrowser() {

        return new Promise((resolve) => {

            requestAnimationFrame(() => {
                setTimeout(resolve, 0);
            });

        });

    }


    function revokeObjectUrl() {

        if (state.objectUrl) {

            URL.revokeObjectURL(
                state.objectUrl
            );

            state.objectUrl = null;

        }

    }


    /* =====================================================
       30. START
       ===================================================== */

    initialize();

});
