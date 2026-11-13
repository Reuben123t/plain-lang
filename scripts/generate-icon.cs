using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Collections.Generic;

namespace PlainIconGenerator
{
    class Program
    {
        static void Main(string[] args)
        {
            string outputDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "assets");
            if (!Directory.Exists(outputDir))
            {
                Directory.CreateDirectory(outputDir);
            }

            int[] sizes = new int[] { 256, 128, 64, 48, 32, 16 };
            List<byte[]> pngBuffers = new List<byte[]>();

            foreach (int size in sizes)
            {
                using (Bitmap bmp = GeneratePlainLogoBitmap(size))
                {
                    if (size == 256)
                    {
                        bmp.Save(Path.Combine(outputDir, "plain-logo.png"), ImageFormat.Png);
                    }
                    if (size == 32)
                    {
                        bmp.Save(Path.Combine(outputDir, "favicon-32x32.png"), ImageFormat.Png);
                    }

                    using (MemoryStream ms = new MemoryStream())
                    {
                        bmp.Save(ms, ImageFormat.Png);
                        pngBuffers.Add(ms.ToArray());
                    }
                }
            }

            // Save multi-resolution .ico file
            string icoPath = Path.Combine(outputDir, "plain-icon.ico");
            WriteIcoFile(icoPath, sizes, pngBuffers);
            Console.WriteLine("Generated PLAIN logo icon at: " + icoPath);
        }

        static Bitmap GeneratePlainLogoBitmap(int size)
        {
            Bitmap bmp = new Bitmap(size, size, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.SmoothingMode = SmoothingMode.HighQuality;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.Clear(Color.Transparent);

                float scale = size / 512.0f;

                // 1. Base rounded rectangle
                float rectX = 24 * scale;
                float rectY = 24 * scale;
                float rectW = 464 * scale;
                float rectH = 464 * scale;
                float cornerRadius = 96 * scale;

                using (GraphicsPath bgPath = CreateRoundedRect(new RectangleF(rectX, rectY, rectW, rectH), cornerRadius))
                {
                    using (LinearGradientBrush bgBrush = new LinearGradientBrush(
                        new PointF(0, 0),
                        new PointF(size, size),
                        Color.FromArgb(255, 12, 16, 28),   // Dark Midnight Blue
                        Color.FromArgb(255, 3, 7, 18)))    // Pitch Dark Slate
                    {
                        g.FillPath(bgBrush, bgPath);
                    }

                    using (Pen borderPen = new Pen(Color.FromArgb(80, 56, 189, 248), 3 * scale))
                    {
                        g.DrawPath(borderPen, bgPath);
                    }
                }

                // 2. Futuristic Accent Circle Glow
                float center = size / 2.0f;
                float radius = 170 * scale;
                using (Pen ringPen = new Pen(Color.FromArgb(35, 14, 165, 233), 1.5f * scale))
                {
                    ringPen.DashStyle = DashStyle.Dash;
                    g.DrawEllipse(ringPen, center - radius, center - radius, radius * 2, radius * 2);
                }

                // 3. Neon Gradient for the PLAIN "P"
                RectangleF pBounds = new RectangleF(120 * scale, 120 * scale, 280 * scale, 280 * scale);
                using (LinearGradientBrush pBrush = new LinearGradientBrush(
                    new PointF(120 * scale, 120 * scale),
                    new PointF(380 * scale, 380 * scale),
                    Color.FromArgb(255, 56, 189, 248),   // Electric Cyan
                    Color.FromArgb(255, 99, 102, 241)))  // Vibrant Indigo
                {
                    // Vertical Stem of "P"
                    float stemX = 136 * scale;
                    float stemY = 128 * scale;
                    float stemW = 56 * scale;
                    float stemH = 256 * scale;
                    float stemR = 24 * scale;
                    using (GraphicsPath stemPath = CreateRoundedRect(new RectangleF(stemX, stemY, stemW, stemH), stemR))
                    {
                        g.FillPath(pBrush, stemPath);
                    }

                    // Upper Loop of "P"
                    using (Pen loopPen = new Pen(pBrush, 56 * scale))
                    {
                        loopPen.StartCap = LineCap.Round;
                        loopPen.EndCap = LineCap.Round;
                        loopPen.LineJoin = LineJoin.Round;

                        using (GraphicsPath loopPath = new GraphicsPath())
                        {
                            loopPath.AddLine(164 * scale, 128 * scale, 280 * scale, 128 * scale);
                            loopPath.AddArc(210 * scale, 128 * scale, 170 * scale, 216 * scale, -90, 180);
                            loopPath.AddLine(280 * scale, 344 * scale, 164 * scale, 344 * scale);
                            g.DrawPath(loopPen, loopPath);
                        }
                    }
                }

                // 4. White Terminal Prompt Chevron ">" inside P loop
                using (Pen chevronPen = new Pen(Color.FromArgb(240, 255, 255, 255), Math.Max(2f, 18 * scale)))
                {
                    chevronPen.StartCap = LineCap.Round;
                    chevronPen.EndCap = LineCap.Round;
                    chevronPen.LineJoin = LineJoin.Round;

                    PointF[] chevronPoints = new PointF[] {
                        new PointF(230 * scale, 206 * scale),
                        new PointF(272 * scale, 236 * scale),
                        new PointF(230 * scale, 266 * scale)
                    };
                    g.DrawLines(chevronPen, chevronPoints);
                }

                // 5. Emerald Cyber Node dot
                if (size >= 32)
                {
                    float dotX = 338 * scale;
                    float dotY = 236 * scale;
                    float dotR = 12 * scale;
                    using (SolidBrush dotGlow = new SolidBrush(Color.FromArgb(120, 16, 185, 129)))
                    {
                        g.FillEllipse(dotGlow, dotX - dotR * 1.5f, dotY - dotR * 1.5f, dotR * 3f, dotR * 3f);
                    }
                    using (SolidBrush dotBrush = new SolidBrush(Color.FromArgb(255, 52, 211, 153)))
                    {
                        g.FillEllipse(dotBrush, dotX - dotR, dotY - dotR, dotR * 2, dotR * 2);
                    }
                    using (SolidBrush whiteCore = new SolidBrush(Color.White))
                    {
                        g.FillEllipse(whiteCore, dotX - dotR * 0.4f, dotY - dotR * 0.4f, dotR * 0.8f, dotR * 0.8f);
                    }
                }
            }
            return bmp;
        }

        static GraphicsPath CreateRoundedRect(RectangleF rect, float radius)
        {
            GraphicsPath path = new GraphicsPath();
            float diameter = radius * 2;
            RectangleF arc = new RectangleF(rect.X, rect.Y, diameter, diameter);

            // Top-left
            path.AddArc(arc, 180, 90);

            // Top-right
            arc.X = rect.Right - diameter;
            path.AddArc(arc, 270, 90);

            // Bottom-right
            arc.Y = rect.Bottom - diameter;
            path.AddArc(arc, 0, 90);

            // Bottom-left
            arc.X = rect.Left;
            path.AddArc(arc, 90, 90);

            path.CloseFigure();
            return path;
        }

        static void WriteIcoFile(string outputPath, int[] sizes, List<byte[]> pngBuffers)
        {
            using (FileStream fs = new FileStream(outputPath, FileMode.Create, FileAccess.Write))
            using (BinaryWriter bw = new BinaryWriter(fs))
            {
                // ICONDIR header
                bw.Write((ushort)0); // Reserved
                bw.Write((ushort)1); // Type 1 = Icon
                bw.Write((ushort)sizes.Length); // Count

                // Calculate where first image begins
                int offset = 6 + (sizes.Length * 16);

                // Write directory entries
                for (int i = 0; i < sizes.Length; i++)
                {
                    int s = sizes[i];
                    byte[] data = pngBuffers[i];

                    bw.Write((byte)(s >= 256 ? 0 : s)); // Width
                    bw.Write((byte)(s >= 256 ? 0 : s)); // Height
                    bw.Write((byte)0); // Color count
                    bw.Write((byte)0); // Reserved
                    bw.Write((ushort)1); // Color planes
                    bw.Write((ushort)32); // Bit count
                    bw.Write((uint)data.Length); // Size in bytes
                    bw.Write((uint)offset); // Offset

                    offset += data.Length;
                }

                // Write image buffers
                for (int i = 0; i < sizes.Length; i++)
                {
                    bw.Write(pngBuffers[i]);
                }
            }
        }
    }
}
