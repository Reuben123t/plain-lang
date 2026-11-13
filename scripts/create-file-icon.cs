using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

class FileIconGenerator
{
    static void Main()
    {
        string outDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "build_assets");
        outDir = Path.GetFullPath(outDir);
        string fileIcoPath = Path.Combine(outDir, "plain-file.ico");
        string appIcoPath = Path.Combine(outDir, "plain.ico");

        int[] sizes = new int[] { 16, 24, 32, 48, 64, 128, 256 };

        // 1. Generate plain-file.ico (Sleek dark source document with PLAIN emblem)
        GenerateIcon(fileIcoPath, sizes, true);
        Console.WriteLine("Generated file icon at: " + fileIcoPath);

        // 2. Generate plain.ico (App & IDE emblem)
        GenerateIcon(appIcoPath, sizes, false);
        Console.WriteLine("Generated app icon at: " + appIcoPath);
    }

    static void GenerateIcon(string outputPath, int[] sizes, bool isDocumentStyle)
    {
        byte[][] pngData = new byte[sizes.Length][];

        for (int i = 0; i < sizes.Length; i++)
        {
            int sz = sizes[i];
            using (Bitmap bmp = new Bitmap(sz, sz, PixelFormat.Format32bppArgb))
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.Clear(Color.Transparent);

                if (isDocumentStyle && sz >= 48)
                {
                    // Large Document View: Sleek document page with folded corner & emblem
                    DrawDocumentPageWithEmblem(g, sz);
                }
                else
                {
                    // Small / Emblem View: Clean, bold high-contrast PLAIN emblem
                    DrawPlainEmblem(g, sz);
                }

                using (MemoryStream ms = new MemoryStream())
                {
                    bmp.Save(ms, ImageFormat.Png);
                    pngData[i] = ms.ToArray();
                }
            }
        }

        // Write Win32 Multi-Resolution .ico file
        using (FileStream fs = new FileStream(outputPath, FileMode.Create, FileAccess.Write))
        using (BinaryWriter bw = new BinaryWriter(fs))
        {
            bw.Write((ushort)0); // Reserved
            bw.Write((ushort)1); // Type 1 = Icon
            bw.Write((ushort)sizes.Length); // Image count

            int dataOffset = 6 + (16 * sizes.Length);

            for (int i = 0; i < sizes.Length; i++)
            {
                int sz = sizes[i];
                bw.Write((byte)(sz >= 256 ? 0 : sz)); // Width
                bw.Write((byte)(sz >= 256 ? 0 : sz)); // Height
                bw.Write((byte)0);                     // Colors
                bw.Write((byte)0);                     // Reserved
                bw.Write((ushort)1);                   // Planes
                bw.Write((ushort)32);                  // Bit count
                bw.Write((uint)pngData[i].Length);     // Bytes in res
                bw.Write((uint)dataOffset);            // Offset

                dataOffset += pngData[i].Length;
            }

            for (int i = 0; i < sizes.Length; i++)
            {
                bw.Write(pngData[i]);
            }
        }
    }

    static void DrawPlainEmblem(Graphics g, int sz)
    {
        float pad = sz <= 24 ? 1.0f : sz * 0.05f;
        float rectSize = sz - (pad * 2);
        float radius = sz * 0.22f;

        // 1. Dark Rounded Emblem Container
        using (GraphicsPath path = GetRoundedRect(new RectangleF(pad, pad, rectSize, rectSize), radius))
        {
            using (LinearGradientBrush bgBrush = new LinearGradientBrush(
                new PointF(0, 0), new PointF(sz, sz),
                Color.FromArgb(255, 15, 23, 42),   // Dark Slate #0f172a
                Color.FromArgb(255, 24, 34, 52)))  // Deep Navy #182234
            {
                g.FillPath(bgBrush, path);
            }

            // Neon Cyan Border
            float borderWidth = sz <= 24 ? 1.5f : Math.Max(1.5f, sz * 0.05f);
            using (Pen borderPen = new Pen(Color.FromArgb(255, 56, 189, 248), borderWidth))
            {
                g.DrawPath(borderPen, path);
            }
        }

        // 2. Bold 'P' Shape
        float scale = sz / 256.0f;
        using (GraphicsPath pPath = new GraphicsPath())
        {
            pPath.StartFigure();
            pPath.AddLine(58 * scale, 48 * scale, 155 * scale, 48 * scale);
            pPath.AddArc(110 * scale, 48 * scale, 90 * scale, 90 * scale, -90, 180);
            pPath.AddLine(155 * scale, 138 * scale, 108 * scale, 138 * scale);
            pPath.AddLine(108 * scale, 208 * scale, 58 * scale, 208 * scale);
            pPath.CloseFigure();

            GraphicsPath hole = new GraphicsPath();
            hole.AddLine(108 * scale, 82 * scale, 144 * scale, 82 * scale);
            hole.AddArc(122 * scale, 82 * scale, 44 * scale, 44 * scale, -90, 180);
            hole.AddLine(144 * scale, 126 * scale, 108 * scale, 126 * scale);
            hole.CloseFigure();

            using (LinearGradientBrush pBrush = new LinearGradientBrush(
                new PointF(0, 48 * scale), new PointF(sz, 208 * scale),
                Color.FromArgb(255, 56, 189, 248),   // Sky Cyan #38bdf8
                Color.FromArgb(255, 129, 140, 248))) // Indigo #818cf8
            {
                g.FillPath(pBrush, pPath);
            }

            g.FillPath(new SolidBrush(Color.FromArgb(255, 15, 23, 42)), hole);
        }

        // 3. Green Terminal Chevron '>' inside 'P'
        using (GraphicsPath chevron = new GraphicsPath())
        {
            chevron.AddLine(114 * scale, 92 * scale, 130 * scale, 104 * scale);
            chevron.AddLine(130 * scale, 104 * scale, 114 * scale, 116 * scale);

            float chevWidth = sz <= 24 ? 1.5f : Math.Max(1.5f, sz * 0.045f);
            using (Pen greenPen = new Pen(Color.FromArgb(255, 74, 222, 128), chevWidth))
            {
                greenPen.StartCap = LineCap.Round;
                greenPen.EndCap = LineCap.Round;
                greenPen.LineJoin = LineJoin.Round;
                g.DrawPath(greenPen, chevron);
            }
        }
    }

    static void DrawDocumentPageWithEmblem(Graphics g, int sz)
    {
        float left = sz * 0.12f;
        float right = sz * 0.88f;
        float top = sz * 0.06f;
        float bottom = sz * 0.94f;
        float foldSize = sz * 0.22f;

        // 1. Document Page Outline with Top-Right Fold
        using (GraphicsPath docPath = new GraphicsPath())
        {
            docPath.StartFigure();
            docPath.AddLine(left + 6, top, right - foldSize, top);
            docPath.AddLine(right - foldSize, top, right, top + foldSize);
            docPath.AddLine(right, top + foldSize, right, bottom - 6);
            docPath.AddArc(right - 12, bottom - 12, 12, 12, 0, 90);
            docPath.AddLine(right - 6, bottom, left + 6, bottom);
            docPath.AddArc(left, bottom - 12, 12, 12, 90, 90);
            docPath.AddLine(left, bottom - 6, left, top + 6);
            docPath.AddArc(left, top, 12, 12, 180, 90);
            docPath.CloseFigure();

            // Dark Slate Sheet
            using (LinearGradientBrush docBrush = new LinearGradientBrush(
                new PointF(left, top), new PointF(right, bottom),
                Color.FromArgb(255, 17, 24, 39),   // Gray 900
                Color.FromArgb(255, 10, 15, 26)))  // Dark Navy
            {
                g.FillPath(docBrush, docPath);
            }

            // Document Border
            using (Pen docBorder = new Pen(Color.FromArgb(255, 51, 65, 85), Math.Max(1.5f, sz * 0.02f)))
            {
                g.DrawPath(docBorder, docPath);
            }
        }

        // 2. Folded Corner Triangle
        using (GraphicsPath foldPath = new GraphicsPath())
        {
            foldPath.StartFigure();
            foldPath.AddLine(right - foldSize, top, right - foldSize, top + foldSize);
            foldPath.AddLine(right - foldSize, top + foldSize, right, top + foldSize);
            foldPath.CloseFigure();

            using (SolidBrush foldBrush = new SolidBrush(Color.FromArgb(255, 30, 41, 59)))
            {
                g.FillPath(foldBrush, foldPath);
            }
            using (Pen foldBorder = new Pen(Color.FromArgb(255, 56, 189, 248), Math.Max(1.2f, sz * 0.015f)))
            {
                g.DrawPath(foldBorder, foldPath);
            }
        }

        // 3. Subtle Code Lines at top
        using (Pen linePen = new Pen(Color.FromArgb(255, 51, 65, 85), Math.Max(1.5f, sz * 0.018f)))
        {
            linePen.StartCap = LineCap.Round;
            linePen.EndCap = LineCap.Round;
            g.DrawLine(linePen, left + (sz * 0.08f), top + (sz * 0.12f), right - foldSize - (sz * 0.04f), top + (sz * 0.12f));
            g.DrawLine(linePen, left + (sz * 0.08f), top + (sz * 0.18f), left + (sz * 0.35f), top + (sz * 0.18f));
        }

        // 4. Center PLAIN Emblem (Hexagonal/Rounded Badge)
        float emblemSize = sz * 0.50f;
        float emblemX = (sz - emblemSize) / 2.0f;
        float emblemY = top + (sz * 0.24f);

        RectangleF emblemRect = new RectangleF(emblemX, emblemY, emblemSize, emblemSize);
        float radius = emblemSize * 0.22f;

        using (GraphicsPath emblemPath = GetRoundedRect(emblemRect, radius))
        {
            using (LinearGradientBrush eBrush = new LinearGradientBrush(
                new PointF(emblemX, emblemY), new PointF(emblemX + emblemSize, emblemY + emblemSize),
                Color.FromArgb(255, 15, 23, 42),
                Color.FromArgb(255, 30, 41, 59)))
            {
                g.FillPath(eBrush, emblemPath);
            }

            using (Pen ePen = new Pen(Color.FromArgb(255, 56, 189, 248), Math.Max(1.5f, sz * 0.035f)))
            {
                g.DrawPath(ePen, emblemPath);
            }
        }

        // Draw 'P' inside emblem
        float pScale = emblemSize / 256.0f;
        using (GraphicsPath pPath = new GraphicsPath())
        {
            pPath.StartFigure();
            pPath.AddLine(emblemX + 58 * pScale, emblemY + 48 * pScale, emblemX + 155 * pScale, emblemY + 48 * pScale);
            pPath.AddArc(emblemX + 110 * pScale, emblemY + 48 * pScale, 90 * pScale, 90 * pScale, -90, 180);
            pPath.AddLine(emblemX + 155 * pScale, emblemY + 138 * pScale, emblemX + 108 * pScale, emblemY + 138 * pScale);
            pPath.AddLine(emblemX + 108 * pScale, emblemY + 208 * pScale, emblemX + 58 * pScale, emblemY + 208 * pScale);
            pPath.CloseFigure();

            GraphicsPath hole = new GraphicsPath();
            hole.AddLine(emblemX + 108 * pScale, emblemY + 82 * pScale, emblemX + 144 * pScale, emblemY + 82 * pScale);
            hole.AddArc(emblemX + 122 * pScale, emblemY + 82 * pScale, 44 * pScale, 44 * pScale, -90, 180);
            hole.AddLine(emblemX + 144 * pScale, emblemY + 126 * pScale, emblemX + 108 * pScale, emblemY + 126 * pScale);
            hole.CloseFigure();

            using (LinearGradientBrush pBrush = new LinearGradientBrush(
                new PointF(emblemX, emblemY), new PointF(emblemX + emblemSize, emblemY + emblemSize),
                Color.FromArgb(255, 56, 189, 248),
                Color.FromArgb(255, 129, 140, 248)))
            {
                g.FillPath(pBrush, pPath);
            }

            g.FillPath(new SolidBrush(Color.FromArgb(255, 15, 23, 42)), hole);
        }

        // Draw Chevron inside P
        using (GraphicsPath chevron = new GraphicsPath())
        {
            chevron.AddLine(emblemX + 114 * pScale, emblemY + 92 * pScale, emblemX + 130 * pScale, emblemY + 104 * pScale);
            chevron.AddLine(emblemX + 130 * pScale, emblemY + 104 * pScale, emblemX + 114 * pScale, emblemY + 116 * pScale);

            using (Pen greenPen = new Pen(Color.FromArgb(255, 74, 222, 128), Math.Max(1.5f, sz * 0.035f)))
            {
                greenPen.StartCap = LineCap.Round;
                greenPen.EndCap = LineCap.Round;
                greenPen.LineJoin = LineJoin.Round;
                g.DrawPath(greenPen, chevron);
            }
        }

        // 5. Bottom "PLAIN" Tag / Label
        float tagWidth = sz * 0.44f;
        float tagHeight = sz * 0.12f;
        float tagX = (sz - tagWidth) / 2.0f;
        float tagY = bottom - (sz * 0.16f);

        using (GraphicsPath tagPath = GetRoundedRect(new RectangleF(tagX, tagY, tagWidth, tagHeight), tagHeight * 0.4f))
        {
            using (SolidBrush tagBg = new SolidBrush(Color.FromArgb(255, 2, 132, 199))) // Sky 600
            {
                g.FillPath(tagBg, tagPath);
            }

            using (Font f = new Font("Segoe UI", tagHeight * 0.65f, FontStyle.Bold, GraphicsUnit.Pixel))
            using (StringFormat sf = new StringFormat() { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center })
            {
                g.DrawString("PLAIN", f, Brushes.White, new RectangleF(tagX, tagY - 1, tagWidth, tagHeight), sf);
            }
        }
    }

    static GraphicsPath GetRoundedRect(RectangleF rect, float radius)
    {
        GraphicsPath path = new GraphicsPath();
        float diameter = radius * 2;
        RectangleF arc = new RectangleF(rect.X, rect.Y, diameter, diameter);

        path.AddArc(arc, 180, 90);
        arc.X = rect.Right - diameter;
        path.AddArc(arc, 270, 90);
        arc.Y = rect.Bottom - diameter;
        path.AddArc(arc, 0, 90);
        arc.X = rect.Left;
        path.AddArc(arc, 90, 90);
        path.CloseFigure();
        return path;
    }
}

