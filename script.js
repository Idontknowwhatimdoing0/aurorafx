const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const invertCheckbox = document.getElementById('invert');
const hueSlider = document.getElementById('hue');
const brightnessSlider = document.getElementById('brightness');
const contrastSlider = document.getElementById('contrast');
const saturationSlider = document.getElementById('saturation');
const volumeSlider = document.getElementById('volume');
const speedSlider = document.getElementById('speed');
const uploader = document.getElementById('videoUploader');

uploader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    video.src = url;
});

video.addEventListener('play', () => {
    video.volume = volumeSlider.value;
    video.playbackRate = speedSlider.value;
    drawFrame();
});

function drawFrame() {
    if (video.paused || video.ended) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = frame.data;
    
    for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];
        
        if (invertCheckbox.checked) {
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
        }
        
        let hsl = rgbToHsl(r, g, b);
        
        hsl[0] = (hsl[0]*360 + Number(hueSlider.value)) % 360 / 360;
        
        hsl[1] *= Number(saturationSlider.value);
        
        hsl[2] += Number(brightnessSlider.value);
        if (hsl[2] > 1) hsl[2] = 1;
        if (hsl[2] < 0) hsl[2] = 0;
        
        let rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
        
        let contrast = Number(contrastSlider.value);
        rgb[0] = ((rgb[0]/255 - 0.5) * contrast + 0.5) * 255;
        rgb[1] = ((rgb[1]/255 - 0.5) * contrast + 0.5) * 255;
        rgb[2] = ((rgb[2]/255 - 0.5) * contrast + 0.5) * 255;
        
        data[i] = rgb[0];
        data[i+1] = rgb[1];
        data[i+2] = rgb[2];
    }
    
    ctx.putImageData(frame, 0, 0);
    
    requestAnimationFrame(drawFrame);
}

volumeSlider.addEventListener('input', () => {
    video.volume = volumeSlider.value;
});

speedSlider.addEventListener('input', () => {
    video.playbackRate = speedSlider.value;
});

function rgbToHsl(r, g, b){
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if(max == min){ h = s = 0; }
    else {
        let d = max - min;
        s = l > 0.5 ? d/(2 - max - min) : d/(max + min);
        switch(max){
            case r: h = (g - b)/d + (g < b ? 6 : 0); break;
            case g: h = (b - r)/d + 2; break;
            case b: h = (r - g)/d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function hslToRgb(h, s, l){
    let r, g, b;
    if(s==0){ r=g=b=l; }
    else {
        function hue2rgb(p, q, t){
            if(t<0) t+=1;
            if(t>1) t-=1;
            if(t<1/6) return p + (q-p)*6*t;
            if(t<1/2) return q;
            if(t<2/3) return p + (q-p)*(2/3 - t)*6;
            return p;
        }
        let q = l < 0.5 ? l*(1+s) : l+s-l*s;
        let p = 2*l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [r*255, g*255, b*255];
}
