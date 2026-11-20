using System;
using System.IO;
using System.Reflection;
using System.Diagnostics;

[assembly: AssemblyTitle("PLAIN Programming Language")]
[assembly: AssemblyDescription("PLAIN is a readable programming language with a 500+ function standard library, editor tooling, browser playground, and local automation.")]
[assembly: AssemblyCompany("PLAIN Language Foundation")]
[assembly: AssemblyProduct("PLAIN")]
[assembly: AssemblyCopyright("Copyright © 2026 PLAIN")]
[assembly: AssemblyTrademark("PLAIN")]
[assembly: AssemblyVersion("1.2.0.0")]
[assembly: AssemblyFileVersion("1.2.0.0")]

namespace PlainLanguage
{
    class Program
    {
        static int Main(string[] args)
        {
            try
            {
                string appDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "PLAIN");
                if (!Directory.Exists(appDir))
                {
                    Directory.CreateDirectory(appDir);
                }

                string nodeExe = Path.Combine(appDir, "plain-runtime.exe");
                string bundleJs = Path.Combine(appDir, "plain-bundle.js");
                string iconFile = Path.Combine(appDir, "plain.ico");

                var assembly = Assembly.GetExecutingAssembly();

                // Extract icon if present
                if (!File.Exists(iconFile))
                {
                    using (var s = assembly.GetManifestResourceStream("plain.ico"))
                    {
                        if (s != null)
                        {
                            using (var fs = new FileStream(iconFile, FileMode.Create, FileAccess.Write, FileShare.None))
                            {
                                s.CopyTo(fs);
                            }
                        }
                    }
                }

                // Extract embedded runtime if not exists or if size is 0
                if (!File.Exists(nodeExe) || new FileInfo(nodeExe).Length < 1000)
                {
                    using (var s = assembly.GetManifestResourceStream("node.exe"))
                    {
                        if (s != null)
                        {
                            using (var fs = new FileStream(nodeExe, FileMode.Create, FileAccess.Write, FileShare.None))
                            {
                                s.CopyTo(fs);
                            }
                        }
                    }
                }

                // Extract bundle
                using (var s = assembly.GetManifestResourceStream("bundle.js"))
                {
                    if (s != null)
                    {
                        using (var fs = new FileStream(bundleJs, FileMode.Create, FileAccess.Write, FileShare.None))
                        {
                            s.CopyTo(fs);
                        }
                    }
                }

                if (!File.Exists(nodeExe))
                {
                    nodeExe = "node";
                }

                var psi = new ProcessStartInfo();
                psi.FileName = nodeExe;

                string cmdArgs = "\"" + bundleJs + "\"";
                for (int i = 0; i < args.Length; i++)
                {
                    string safeArg = args[i].Replace("\"", "\\\"");
                    cmdArgs += " \"" + safeArg + "\"";
                }

                psi.Arguments = cmdArgs;
                psi.UseShellExecute = false;

                using (var proc = Process.Start(psi))
                {
                    proc.WaitForExit();
                    return proc.ExitCode;
                }
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine("Error launching PLAIN: " + ex.Message);
                return 1;
            }
        }
    }
}
