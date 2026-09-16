import React, { useEffect, useRef } from 'react';

/**
 * 3D Animated Canvas DNA Helix that continuously travels, rotates, tilts,
 * and scales through the website based on user scroll position.
 */
export default function DnaStrand({ isDark = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Scroll state with smooth lerping
    let targetScrollProgress = 0;
    let currentScrollProgress = 0;

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 3D Helix Parameters
    const numPairs = 52; // number of base pair rungs
    const helixRadius = 110; // radius of helix
    const verticalSpacing = 28; // spacing between rungs along helix length
    const totalLength = numPairs * verticalSpacing;
    const twistRate = 0.18; // radians per rung

    // Floating background particles
    const numParticles = 45;
    const particles = Array.from({ length: numParticles }, () => ({
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 1600,
      z: (Math.random() - 0.5) * 600,
      size: Math.random() * 2 + 1,
      speedY: (Math.random() - 0.5) * 0.4,
      speedRot: (Math.random() - 0.5) * 0.01,
      alpha: Math.random() * 0.5 + 0.2
    }));

    let baseAngle = 0; // continuous idle spin

    // Waypoint coordinates for scroll trajectory:
    // [progress, targetXPercent, targetYPercent, targetScale, targetTiltZ, targetOpacity]
    const waypoints = [
      { p: 0.00, x: 0.74, y: 0.50, scale: 1.15, tilt: 0.14, opacity: 0.95 },  // Hero (large on right)
      { p: 0.18, x: 0.28, y: 0.48, scale: 1.00, tilt: -0.16, opacity: 0.90 }, // How it works (center-left)
      { p: 0.38, x: 0.70, y: 0.52, scale: 0.95, tilt: 0.20, opacity: 0.88 },  // Features Bento (behind right)
      { p: 0.58, x: 0.32, y: 0.50, scale: 1.05, tilt: -0.12, opacity: 0.92 }, // Analyze Report (behind left)
      { p: 0.78, x: 0.64, y: 0.50, scale: 1.00, tilt: 0.15, opacity: 0.88 },  // Dashboard & Trends (right)
      { p: 0.92, x: 0.50, y: 0.52, scale: 0.90, tilt: 0.05, opacity: 0.75 },  // Ask MediLens (center)
      { p: 1.00, x: 0.50, y: 0.55, scale: 0.75, tilt: 0.00, opacity: 0.35 }   // Footer (fades softly)
    ];

    const interpolate = (p, key) => {
      if (p <= waypoints[0].p) return waypoints[0][key];
      if (p >= waypoints[waypoints.length - 1].p) return waypoints[waypoints.length - 1][key];
      for (let i = 0; i < waypoints.length - 1; i++) {
        if (p >= waypoints[i].p && p <= waypoints[i + 1].p) {
          const t = (p - waypoints[i].p) / (waypoints[i + 1].p - waypoints[i].p);
          // Smooth cosine ease
          const easeT = 0.5 - 0.5 * Math.cos(t * Math.PI);
          return waypoints[i][key] + (waypoints[i + 1][key] - waypoints[i][key]) * easeT;
        }
      }
      return waypoints[0][key];
    };

    // Main animation loop
    const render = () => {
      // Smooth lerp to target scroll
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.06;
      baseAngle += 0.012 + (targetScrollProgress - currentScrollProgress) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const isMobile = width < 768;
      const xPct = isMobile ? 0.5 : interpolate(currentScrollProgress, 'x');
      const yPct = interpolate(currentScrollProgress, 'y');
      const scaleMultiplier = (isMobile ? 0.7 : 1) * interpolate(currentScrollProgress, 'scale');
      const tiltZ = interpolate(currentScrollProgress, 'tilt');
      const globalOpacity = interpolate(currentScrollProgress, 'opacity');

      const centerX = width * xPct;
      const centerY = height * yPct;

      const fov = 650; // Camera field of view / focal length

      // Array to collect 3D drawables for depth sorting (z-index)
      const renderList = [];

      // 1. Calculate DNA helix nodes and rungs
      for (let i = 0; i < numPairs; i++) {
        // Position along the helix column
        const yOffset = (i - numPairs / 2) * verticalSpacing;
        const rungAngle = baseAngle + i * twistRate;

        // Strand A & B 3D coordinates relative to helix center
        const xA = Math.cos(rungAngle) * helixRadius;
        const zA = Math.sin(rungAngle) * helixRadius;
        const xB = -xA;
        const zB = -zA;

        // Apply tilt rotation around Z axis
        const cosTilt = Math.cos(tiltZ);
        const sinTilt = Math.sin(tiltZ);

        const applyTransform = (x, y, z) => {
          // Rotate around Z axis by tilt
          const rx = (x * cosTilt - y * sinTilt) * scaleMultiplier;
          const ry = (x * sinTilt + y * cosTilt) * scaleMultiplier;
          const rz = z * scaleMultiplier;

          // 3D Perspective Projection
          const distance = fov + rz;
          const proj = fov / Math.max(distance, 50);

          return {
            x2d: centerX + rx * proj,
            y2d: centerY + ry * proj,
            z: rz,
            proj: proj
          };
        };

        const nodeA = applyTransform(xA, yOffset, zA);
        const nodeB = applyTransform(xB, yOffset, zB);

        // Midpoint for depth sorting of the rung bridge
        const avgZ = (nodeA.z + nodeB.z) / 2;

        renderList.push({
          type: 'rung',
          z: avgZ,
          nodeA,
          nodeB,
          index: i
        });

        renderList.push({
          type: 'nodeA',
          z: nodeA.z,
          x: nodeA.x2d,
          y: nodeA.y2d,
          proj: nodeA.proj
        });

        renderList.push({
          type: 'nodeB',
          z: nodeB.z,
          x: nodeB.x2d,
          y: nodeB.y2d,
          proj: nodeB.proj
        });
      }

      // 2. Add floating biotech particles
      particles.forEach((p) => {
        p.y += p.speedY;
        if (p.y > 800) p.y = -800;
        if (p.y < -800) p.y = 800;

        // Rotate around Y
        const cosRot = Math.cos(baseAngle * 0.3);
        const sinRot = Math.sin(baseAngle * 0.3);
        const px = p.x * cosRot - p.z * sinRot;
        const pz = p.x * sinRot + p.z * cosRot;

        const proj = fov / Math.max(fov + pz * scaleMultiplier, 50);
        const x2d = centerX + px * scaleMultiplier * proj;
        const y2d = centerY + p.y * scaleMultiplier * proj;

        renderList.push({
          type: 'particle',
          z: pz * scaleMultiplier,
          x: x2d,
          y: y2d,
          size: p.size * proj,
          alpha: p.alpha
        });
      });

      // 3. Sort all elements back-to-front by Z depth
      renderList.sort((a, b) => a.z - b.z);

      // 4. Render 3D scene onto canvas
      ctx.save();
      ctx.globalAlpha = globalOpacity;

      renderList.forEach((item) => {
        // Calculate depth brightness (closer = brighter & larger)
        const depthFactor = (item.z + helixRadius * 1.5) / (helixRadius * 3);
        const clampedDepth = Math.max(0.15, Math.min(1.0, depthFactor));

        if (item.type === 'rung') {
          // Draw hydrogen bond connector rung with gradient
          const grad = ctx.createLinearGradient(
            item.nodeA.x2d, item.nodeA.y2d,
            item.nodeB.x2d, item.nodeB.y2d
          );
          
          // Subtle elegant glow in light mode, vibrant glow in dark mode
          const rungAlphaA = (isDark ? 0.75 : 0.50) * clampedDepth;
          const rungAlphaMid = (isDark ? 0.45 : 0.30) * clampedDepth;
          const rungAlphaB = (isDark ? 0.75 : 0.50) * clampedDepth;

          grad.addColorStop(0, `rgba(249, 115, 22, ${rungAlphaA})`);
          grad.addColorStop(0.5, `rgba(168, 85, 247, ${rungAlphaMid})`);
          grad.addColorStop(1, `rgba(251, 146, 60, ${rungAlphaB})`);

          ctx.beginPath();
          ctx.moveTo(item.nodeA.x2d, item.nodeA.y2d);
          ctx.lineTo(item.nodeB.x2d, item.nodeB.y2d);
          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(0.8, 2.2 * item.nodeA.proj * clampedDepth);
          ctx.stroke();

          // Small glowing midpoint pearl on rung
          const midX = (item.nodeA.x2d + item.nodeB.x2d) / 2;
          const midY = (item.nodeA.y2d + item.nodeB.y2d) / 2;
          ctx.beginPath();
          ctx.arc(midX, midY, Math.max(1, 2.5 * item.nodeA.proj * clampedDepth), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(192, 132, 252, ${(isDark ? 0.6 : 0.4) * clampedDepth})`;
          ctx.fill();

        } else if (item.type === 'nodeA' || item.type === 'nodeB') {
          // Luminous strand base node
          const radius = Math.max(2.0, (item.type === 'nodeA' ? 6.2 : 5.6) * item.proj * clampedDepth);

          // Outer soft glow halo
          const glowGrad = ctx.createRadialGradient(
            item.x, item.y, 0,
            item.x, item.y, radius * (isDark ? 3.2 : 2.5)
          );

          const isNodeA = item.type === 'nodeA';
          const r = isNodeA ? 249 : 251;
          const g = isNodeA ? 115 : 146;
          const b = isNodeA ? 22 : 60;

          const haloMaxAlpha = isDark ? 0.85 : 0.45;
          const haloMidAlpha = isDark ? 0.35 : 0.20;

          glowGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${haloMaxAlpha * clampedDepth})`);
          glowGrad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${haloMidAlpha * clampedDepth})`);
          glowGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

          ctx.beginPath();
          ctx.arc(item.x, item.y, radius * (isDark ? 3.2 : 2.5), 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();

          // Core bright bead
          ctx.beginPath();
          ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = isDark 
            ? `rgba(255, 255, 255, ${0.9 * clampedDepth})`
            : `rgba(255, 247, 237, ${0.95 * clampedDepth})`;
          ctx.fill();

        } else if (item.type === 'particle') {
          // Glowing floating particles
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(249, 115, 22, ${item.alpha * clampedDepth})`;
          ctx.shadowColor = 'rgba(249, 115, 22, 0.6)';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      style={{ willChange: 'transform' }}
    />
  );
}
