const densityOptions = [
  "Ñ@#W$9876543210?!abc;:+=-,._ ",
  '       .:-i|=+%O#@',
  '        .:░▒▓█',
  ' ░▒▓█',
  ' .,:;ox%#@',
  ' .-+*%$@',
  ' .,;!lI|/\\i)(1}tfjrxn',
  ' .\'`^",:;Il!i><~+_-?][{1}()|\\/',
  ' MNHQOVLlti+=~-.    ',
  ' ██▓▒░  ',
  '█▉▊▋▌▍▎▏ ',
  '●◐◑◒◓○',
  '▓▓▒▒░░  ',
  '◆◇◈◉○●',
  'custom'
];
let currentDensity = 0;
let video;
let asciiDiv;
let resolutionSlider, contrastSlider, brightnessSlider, fontSizeSlider;
let videoWidth = 80, videoHeight = 45;
let contrast = 1.0, brightness = 0;
let playPauseButton;
let isPlaying = false;
let invertColors = true;
let showColors = false;
let videoLoaded = false;
let invertCheckbox, colorCheckbox;
let fontColorPicker, bgColorPicker;
let customTextInput;
let customDensity = "";
let bgm;

function setup() {
  noCanvas();
  
  let controlsDiv = createDiv();
  controlsDiv.class('controls');
  
  // Load default video
  video = createVideo('assets/video.mp4');
  video.size(videoWidth, videoHeight);
  video.hide();
  video.loop();
  // Mute the video element itself (we'll use separate bgm). Start paused.
  if (video.elt) {
    video.elt.setAttribute('playsinline','');
    video.elt.muted = true;

    // Add event listeners for video loading
    video.elt.addEventListener('loadeddata', () => {
      videoLoaded = true;
      playPauseButton.html('Play/Pause');
      playPauseButton.removeAttribute('disabled');
    });

    video.elt.addEventListener('canplay', () => {
      videoLoaded = true;
    });
  }
  video.volume(0);
  video.pause();
  isPlaying = false;

  // Load background music (no autoplay due to browser policies)
  bgm = createAudio('assets/NewMoney.mp3');
  bgm.loop();
  bgm.volume(1.0);
  
  // Create play/pause button
  playPauseButton = createButton('Loading...');
  playPauseButton.attribute('disabled', '');
  playPauseButton.mousePressed(togglePlayPause);
  controlsDiv.child(playPauseButton);
  
  // Create UI controls
  controlsDiv.child(createP('Resolution (Width):'));
  resolutionSlider = createSlider(40, 160, videoWidth, 10);
  controlsDiv.child(resolutionSlider);
  
  
  controlsDiv.child(createP('Contrast:'));
  contrastSlider = createSlider(0.1, 3.0, contrast, 0.1);
  controlsDiv.child(contrastSlider);
  
  controlsDiv.child(createP('Brightness:'));
  brightnessSlider = createSlider(-100, 100, brightness, 5);
  controlsDiv.child(brightnessSlider);
  
  controlsDiv.child(createP('Font Size:'));
  fontSizeSlider = createSlider(8, 20, 12, 1);
  controlsDiv.child(fontSizeSlider);
  
  controlsDiv.child(createP('Density Style:'));
  let densitySelect = createSelect();
  const styleNames = [
    'Classic Complex', 'Simple Gradient', 'Block Unicode', 'Block Simple', 
    'Minimal', 'Clean', 'Extended ASCII', 'Full ASCII', 'Shaded Classic',
    'Block Heavy', 'Block Fade', 'Circle', 'Block Pattern', 'Geometric', 'Custom'
  ];
  for (let i = 0; i < densityOptions.length; i++) {
    densitySelect.option(styleNames[i], i);
  }
  densitySelect.selected(0);
  densitySelect.changed(() => {
    currentDensity = parseInt(densitySelect.value());
    // Show/hide custom input
    if (currentDensity === densityOptions.length - 1) {
      customTextInput.show();
    } else {
      customTextInput.hide();
    }
  });
  controlsDiv.child(densitySelect);
  
  // Custom density input
  controlsDiv.child(createP('Custom characters (light to dark):'));
  customTextInput = createInput(customDensity);
  customTextInput.attribute('placeholder', 'Example:  .:-=+*#%@');
  customTextInput.input(() => {
    customDensity = customTextInput.value();
  });
  customTextInput.hide(); // Hidden by default
  controlsDiv.child(customTextInput);
  
  // Color options
  controlsDiv.child(createP('Color options:'));
  invertCheckbox = createCheckbox('Color invert', true);
  invertCheckbox.changed(() => {
    invertColors = invertCheckbox.checked();
  });
  controlsDiv.child(invertCheckbox);
  
  colorCheckbox = createCheckbox('Original color', false);
  colorCheckbox.changed(() => {
    showColors = colorCheckbox.checked();
  });
  controlsDiv.child(colorCheckbox);
  
  // Color pickers
  controlsDiv.child(createP('Font color:'));
  fontColorPicker = createColorPicker('#ffffff');
  fontColorPicker.changed(() => {
    asciiDiv.style('color', fontColorPicker.value());
  });
  controlsDiv.child(fontColorPicker);
  
  controlsDiv.child(createP('Background color'));
  bgColorPicker = createColorPicker('#000000');
  bgColorPicker.changed(() => {
    document.body.style.backgroundColor = bgColorPicker.value();
  });
  controlsDiv.child(bgColorPicker);
  
  asciiDiv = createDiv().style('font-family','monospace').style('color', '#ffffff');
  
  // Set initial background color
  document.body.style.backgroundColor = '#000000';
}

function draw() {
  // Only process if video is loaded and available
  if (!video || !videoLoaded || video.width === 0 || video.height === 0) {
    return;
  }

  // Additional check to ensure video element is ready
  if (!video.elt || video.elt.readyState < 2) {
    return;
  }
  
  // Update parameters from sliders
  let newWidth = resolutionSlider.value();
  let fontSize = fontSizeSlider.value();
  
  // Calculate height based on 16:9 ratio and font size
  // Characters are typically 1.6-2x taller than wide, so adjust accordingly
  let charAspectRatio = fontSize / (fontSize * 0.6); // Approximation du ratio caractère
  let newHeight = floor((newWidth * 9/16) / charAspectRatio);
  
  contrast = contrastSlider.value();
  brightness = brightnessSlider.value();
  
  // Update video size if resolution changed
  if (newWidth !== videoWidth || newHeight !== videoHeight) {
    videoWidth = newWidth;
    videoHeight = newHeight;
    video.size(videoWidth, videoHeight);
  }
  
  // Update font size and line height to maintain aspect ratio
  asciiDiv.style('font-size', fontSize + 'px');
  asciiDiv.style('line-height', (fontSize * 1.2) + 'px'); // Adjust line-height to maintain 16:9

  // Safely load pixels with error handling
  try {
    video.loadPixels();
    if (!video.pixels || video.pixels.length === 0) {
      return;
    }
  } catch (error) {
    console.warn('Error loading video pixels:', error);
    return;
  }
  let density;
  
  // Use custom density if selected, otherwise use predefined
  if (currentDensity === densityOptions.length - 1) {
    // Custom option selected
    if (customDensity.length > 0) {
      density = customDensity;
    } else {
      density = ' .:-=+*#%@'; // Default fallback
    }
  } else {
    density = densityOptions[currentDensity];
  }
  
  const len = density.length - 1;

  // Pixel Array
  if (showColors) {
    // Optimized color mode: build HTML with fewer DOM updates
    let htmlChunks = [];
    for (let j = 0; j < video.height; j++) {
      let lineChunk = '';
      for (let i = 0; i < video.width; i++) {
        const idx = (i + j * video.width) * 4;
        let r = video.pixels[idx];
        let g = video.pixels[idx+1];
        let b = video.pixels[idx+2];
        let avg = (r + g + b) / 3;
        
        // Apply contrast and brightness
        avg = constrain((avg - 128) * contrast + 128 + brightness, 0, 255);
        
        // Invert colors if option is checked
        if (invertColors) {
          avg = 255 - avg;
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        }
        
        const charIndex = floor(map(avg, 0, 255, 0, len));
        const c = density.charAt(charIndex);
        
        if (c === ' ') {
          lineChunk += '&nbsp;';
        } else {
          lineChunk += `<span style="color:rgb(${r},${g},${b})">${c}</span>`;
        }
      }
      htmlChunks.push(lineChunk);
    }
    asciiDiv.html(htmlChunks.join('<br/>'));
  } else {
    // Fast monochrome mode
    let textLines = [];
    for (let j = 0; j < video.height; j++) {
      let line = '';
      for (let i = 0; i < video.width; i++) {
        const idx = (i + j * video.width) * 4;
        let r = video.pixels[idx];
        let g = video.pixels[idx+1];
        let b = video.pixels[idx+2];
        let avg = (r + g + b) / 3;
        
        // Apply contrast and brightness
        avg = constrain((avg - 128) * contrast + 128 + brightness, 0, 255);
        
        // Invert colors if option is checked
        if (invertColors) {
          avg = 255 - avg;
        }
        
        const charIndex = floor(map(avg, 0, 255, 0, len));
        const c = density.charAt(charIndex);
        line += (c === ' ') ? '&nbsp;' : c;
      }
      textLines.push(line);
    }
    asciiDiv.html(textLines.join('<br/>'));
  }
}


function togglePlayPause() {
  if (video && videoLoaded) {
    if (isPlaying) {
      video.pause();
      if (bgm) bgm.pause();
      isPlaying = false;
    } else {
      video.play();
      if (bgm) bgm.play();
      isPlaying = true;
    }
  }
}
