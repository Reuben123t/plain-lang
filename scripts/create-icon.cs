using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

class IconGenerator
{
    static void Main()
    {
        string outPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "build_assets", "plain.ico");
        outPath = Path.GetFullPath(outPath);

        int[] sizes = new int[] { 16, 32, 48, 256 };
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

                float pad = sz * 0.06f;
                float rectSize = sz - (pad * 2);
                float radius = sz * 0.22f;

                // 1. Draw rounded container (dark slate background with cyan glowing border)
                using (GraphicsPath path = GetRoundedRect(new RectangleF(pad, pad, rectSize, rectSize), radius))
                {
                    // Gradient background
                    using (LinearGradientBrush bgBrush = new LinearGradientBrush(
                        new PointF(0, 0), new PointF(sz, sz),
                        Color.FromArgb(255, 15, 23, 42),   // Dark Slate #0f172a
                        Color.FromArgb(255, 30, 41, 59)))  // Slate #1e293b
                    {
                        g.FillPath(bgBrush, path);
                    }

                    // Vibrant Cyan Border
                    using (Pen borderPen = new Pen(Color.FromArgb(255, 56, 189, 248), Math.Max(1.5f, sz * 0.04f)))
                    {
                        g.DrawPath(borderPen, path);
                    }
                }

                // 2. Draw Stylized Modern 'P' with terminal angle
                float scale = sz / 256.0f;
                using (GraphicsPath pPath = new GraphicsPath())
                {
                    // Outer P shape
                    pPath.StartFigure();
                    pPath.AddLine(60 * scale, 50 * scale, 150 * scale, 50 * scale);
                    pPath.AddArc(115 * scale, 50 * scale, 85 * scale, 85 * scale, -90, 180);
                    pPath.AddLine(150 * scale, 135 * scale, 105 * scale, 135 * scale);
                    pPath.AddLine(105 * scale, 206 * scale, 60 * scale, 206 * scale);
                    pPath.CloseFigure();

                    // Inner P hole
                    GraphicsPath hole = new GraphicsPath();
                    hole.AddLine(105 * scale, 82 * scale, 142 * scale, 82 * scale);
                    hole.AddArc(120 * scale, 82 * scale, 44 * scale, 44 * scale, -90, 180);
                    hole.AddLine(142 * scale, 126 * scale, 105 * scale, 126 * scale);
                    hole.CloseFigure();

                    using (LinearGradientBrush pBrush = new LinearGradientBrush(
                        new PointF(0, 50 * scale), new PointF(sz, 200 * scale),
                        Color.FromArgb(255, 56, 189, 248),  // Sky 400 #38bdf8
                        Color.FromArgb(255, 129, 140, 248))) // Indigo 400 #818cf8
                    {
                        g.FillPath(pBrush, pPath);
                    }

                    // Cut out the inner hole
                    g.FillPath(new SolidBrush(Color.FromArgb(255, 15, 23, 42)), hole);
                }

                // 3. Draw Green Terminal Prompt '>' inside the P loop
                using (GraphicsPath chevron = new GraphicsPath())
                {
                    chevron.AddLine(114 * scale, 93 * scale, 128 * scale, 104 * scale);
                    chevron.AddLine(128 * scale, 104 * scale, 114 * scale, 115 * scale);

                    using (Pen greenPen = new Pen(Color.FromArgb(255, 74, 222, 128), Math.Max(1.5f, sz * 0.035f)))
                    {
                        greenPen.StartCap = LineCap.Round;
                        greenPen.EndCap = LineCap.Round;
                        greenPen.LineJoin = LineJoin.Round;
                        g.DrawPath(greenPen, chevron);
                    }
                }

                using (MemoryStream ms = new MemoryStream())
                {
                    bmp.Save(ms, ImageFormat.Png);
                    pngData[i] = ms.ToArray();
                }
            }
        }

        // Write multi-resolution .ico file
        using (FileStream fs = new FileStream(outPath, FileMode.Create, FileAccess.Write))
        using (BinaryWriter bw = new BinaryWriter(fs))
        {
            // ICONDIR
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

            // Write image bodies
            for (int i = 0; i < sizes.Length; i++)
            {
                bw.Write(pngData[i]);
            }
        }

        Console.WriteLine("Icon created successfully at: " + outPath);
    }

    static GraphicsPath GetRoundedRect(RectangleF rect, float radius)
    {
        GraphicsPath path = new GraphicsPath();
        float diameter = radius * 2;
        RectangleF arc = new RectangleF(rect.X, rect.Y, diameter, diameter);

        // top-left
        path.AddArc(arc, 180, 90);
        // top-right
        arc.X = rect.Right - diameter;
        path.AddArc(arc, 270, 90);
        // bottom-right
        arc.Y = rect.Bottom - diameter;
        path.AddArc(arc, 0, 90);
        // bottom-left
        arc.X = rect.Left;
        path.AddArc(arc, 90, 90);
        path.CloseFigure();
        return path;
    }
}

