class AmbientLighting {
  constructor(videoWrapper, iframe) {
    this.videoWrapper = videoWrapper;
    this.iframe = iframe;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.animationFrame = null;
    this.isActive = false;
    this.lastColor = null;
    this.errorCount = 0;
    this.maxErrorCount = 3;
    this.isCrossOrigin = false;

    // Set up message listener for cross-origin communication
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  handleMessage(event) {
    // Verify the message is from our iframe
    if (event.source !== this.iframe.contentWindow) return;
    
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'ambientColor') {
        this.updateLightingEffect(data.color);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;

    // Try direct access first
    try {
      const video = this.iframe.contentDocument?.querySelector('video');
      if (video) {
        this.updateLighting();
        return;
      }
    } catch (error) {
      console.log('Direct access failed, trying cross-origin approach');
      this.isCrossOrigin = true;
    }

    // For cross-origin iframes, send a message to start the effect
    if (this.isCrossOrigin) {
      this.iframe.contentWindow.postMessage(JSON.stringify({
        type: 'startAmbientLighting'
      }), '*');
    }
  }

  stop() {
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  async updateLighting() {
    if (!this.isActive) return;

    try {
      // Get the video element from the iframe
      const video = this.iframe.contentDocument?.querySelector('video');
      if (!video) {
        // If no video found, try again after a short delay
        this.animationFrame = requestAnimationFrame(() => this.updateLighting());
        return;
      }

      // Check if video is ready
      if (video.readyState < 2) { // 2 = HAVE_CURRENT_DATA
        this.animationFrame = requestAnimationFrame(() => this.updateLighting());
        return;
      }

      // Create a temporary canvas to analyze video content
      this.canvas.width = video.videoWidth;
      this.canvas.height = video.videoHeight;
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);

      // Sample colors from the edges
      const edgeColors = this.sampleEdgeColors();
      const dominantColor = this.getDominantColor(edgeColors);

      // Only update if the color has changed significantly
      if (!this.lastColor || this.isColorDifferent(dominantColor, this.lastColor)) {
        this.updateLightingEffect(dominantColor);
        this.lastColor = dominantColor;
      }

      this.errorCount = 0; // Reset error count on success
    } catch (error) {
      console.error('Error updating ambient lighting:', error);
      this.errorCount++;
      
      // If we've had too many errors, stop trying
      if (this.errorCount >= this.maxErrorCount) {
        console.warn('Too many errors, stopping ambient lighting');
        this.stop();
        return;
      }
    }

    this.animationFrame = requestAnimationFrame(() => this.updateLighting());
  }

  isColorDifferent(color1, color2, threshold = 20) {
    const diff = Math.abs(color1[0] - color2[0]) + 
                Math.abs(color1[1] - color2[1]) + 
                Math.abs(color1[2] - color2[2]);
    return diff > threshold;
  }

  sampleEdgeColors() {
    const colors = [];
    const width = this.canvas.width;
    const height = this.canvas.height;
    const sampleSize = 10;

    // Sample top edge
    for (let x = 0; x < width; x += sampleSize) {
      const pixel = this.ctx.getImageData(x, 0, 1, 1).data;
      colors.push([pixel[0], pixel[1], pixel[2]]);
    }

    // Sample bottom edge
    for (let x = 0; x < width; x += sampleSize) {
      const pixel = this.ctx.getImageData(x, height - 1, 1, 1).data;
      colors.push([pixel[0], pixel[1], pixel[2]]);
    }

    // Sample left edge
    for (let y = 0; y < height; y += sampleSize) {
      const pixel = this.ctx.getImageData(0, y, 1, 1).data;
      colors.push([pixel[0], pixel[1], pixel[2]]);
    }

    // Sample right edge
    for (let y = 0; y < height; y += sampleSize) {
      const pixel = this.ctx.getImageData(width - 1, y, 1, 1).data;
      colors.push([pixel[0], pixel[1], pixel[2]]);
    }

    return colors;
  }

  getDominantColor(colors) {
    // Calculate average color
    const avg = colors.reduce((acc, color) => {
      acc[0] += color[0];
      acc[1] += color[1];
      acc[2] += color[2];
      return acc;
    }, [0, 0, 0]);

    avg[0] = Math.round(avg[0] / colors.length);
    avg[1] = Math.round(avg[1] / colors.length);
    avg[2] = Math.round(avg[2] / colors.length);

    return avg;
  }

  updateLightingEffect(color) {
    const [r, g, b] = color;
    const colorString = `rgba(${r}, ${g}, ${b}, 0.3)`;
    const gradientColor = `rgba(${r}, ${g}, ${b}, 0.1)`;

    // Update the video wrapper's lighting effect
    this.videoWrapper.style.boxShadow = `0 0 30px ${colorString}`;
    this.videoWrapper.style.background = `linear-gradient(135deg, ${colorString}, ${gradientColor})`;
    
    // Update the iframe's glow effect
    this.iframe.style.boxShadow = `0 0 20px ${colorString}`;
  }
} 