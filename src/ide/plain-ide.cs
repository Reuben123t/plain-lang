using System;
using System.IO;
using System.Text;
using System.Drawing;
using System.Diagnostics;
using System.Windows.Forms;
using System.Collections.Generic;

[assembly: System.Reflection.AssemblyTitle("PLAIN IDE")]
[assembly: System.Reflection.AssemblyDescription("Simple Python IDLE-like Desktop Environment for PLAIN")]
[assembly: System.Reflection.AssemblyCompany("PLAIN Language Foundation")]
[assembly: System.Reflection.AssemblyProduct("PLAIN Language Environment")]
[assembly: System.Reflection.AssemblyCopyright("Copyright © 2026 PLAIN")]
[assembly: System.Reflection.AssemblyVersion("1.2.0.0")]
[assembly: System.Reflection.AssemblyFileVersion("1.2.0.0")]

namespace PlainIde
{
    public class PlainIdeForm : Form
    {
        // Explicitly UTF-8 without Byte Order Mark (BOM)
        private static readonly Encoding Utf8NoBom = new UTF8Encoding(false);

        private string currentFilePath = null;
        private bool isModified = false;
        private Process activeProcess = null;

        // UI Controls
        private MenuStrip menuStrip;
        private ToolStrip toolStrip;
        private SplitContainer splitContainer;
        private RichTextBox editorTextBox;
        private RichTextBox shellTextBox;
        private Panel interactivePanel;
        private Label promptLabel;
        private TextBox interactiveInputBox;
        private Button interactiveRunButton;
        private StatusStrip statusStrip;
        private ToolStripStatusLabel statusFileLabel;
        private ToolStripStatusLabel statusCursorLabel;
        private ToolStripStatusLabel statusAuthorLabel;

        // Buttons in toolbar
        private ToolStripButton btnNew;
        private ToolStripButton btnOpen;
        private ToolStripButton btnSave;
        private ToolStripButton btnRun;
        private ToolStripButton btnStop;
        private ToolStripButton btnClear;
        private ToolStripButton btnHelp;

        [STAThread]
        public static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string fileToOpen = null;
            if (args != null && args.Length > 0 && !string.IsNullOrEmpty(args[0]))
            {
                string candidate = args[0].Trim('"', ' ');
                if (File.Exists(candidate))
                {
                    fileToOpen = Path.GetFullPath(candidate);
                }
            }

            Application.Run(new PlainIdeForm(fileToOpen));
        }

        public PlainIdeForm(string initialFilePath)
        {
            InitializeComponent();

            if (!string.IsNullOrEmpty(initialFilePath) && File.Exists(initialFilePath))
            {
                // CRITICAL REQUIREMENT: Load into code-writing area ONLY. DO NOT RUN.
                OpenFile(initialFilePath);
            }
            else
            {
                NewFile();
            }

            PrintShellBanner();
        }

        private void InitializeComponent()
        {
            this.Text = "Untitled - PLAIN IDE";
            this.Size = new Size(1000, 720);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = Color.FromArgb(24, 24, 37);
            this.ForeColor = Color.FromArgb(205, 214, 244);
            this.KeyPreview = true;
            this.KeyDown += PlainIdeForm_KeyDown;
            this.AllowDrop = true;
            this.DragEnter += PlainIdeForm_DragEnter;
            this.DragDrop += PlainIdeForm_DragDrop;

            // Load PLAIN Logo Icon
            try
            {
                string appDir = Path.GetDirectoryName(Application.ExecutablePath);
                string candidate1 = Path.Combine(appDir, "plain.ico");
                string candidate2 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "PLAIN", "plain.ico");

                if (File.Exists(candidate1))
                {
                    this.Icon = new Icon(candidate1);
                }
                else if (File.Exists(candidate2))
                {
                    this.Icon = new Icon(candidate2);
                }
                else
                {
                    Icon extracted = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
                    if (extracted != null) this.Icon = extracted;
                }
            }
            catch { }

            // 1. MenuStrip
            menuStrip = new MenuStrip();
            menuStrip.BackColor = Color.FromArgb(30, 30, 46);
            menuStrip.ForeColor = Color.FromArgb(205, 214, 244);
            menuStrip.Font = new Font("Segoe UI", 9.5F);

            // File Menu
            ToolStripMenuItem fileMenu = new ToolStripMenuItem("&File");
            fileMenu.ForeColor = Color.FromArgb(205, 214, 244);

            ToolStripMenuItem miNew = new ToolStripMenuItem("&New Window", null, (s, e) => NewFile(), Keys.Control | Keys.N);
            ToolStripMenuItem miOpen = new ToolStripMenuItem("&Open...", null, (s, e) => OpenFileDialogPrompt(), Keys.Control | Keys.O);
            ToolStripMenuItem miSave = new ToolStripMenuItem("&Save", null, (s, e) => SaveFile(), Keys.Control | Keys.S);
            ToolStripMenuItem miSaveAs = new ToolStripMenuItem("Save &As...", null, (s, e) => SaveFileAs(), Keys.Control | Keys.Shift | Keys.S);
            ToolStripSeparator sepFile1 = new ToolStripSeparator();
            ToolStripMenuItem miExit = new ToolStripMenuItem("E&xit", null, (s, e) => this.Close(), Keys.Alt | Keys.F4);

            fileMenu.DropDownItems.AddRange(new ToolStripItem[] { miNew, miOpen, miSave, miSaveAs, sepFile1, miExit });

            // Edit Menu
            ToolStripMenuItem editMenu = new ToolStripMenuItem("&Edit");
            editMenu.ForeColor = Color.FromArgb(205, 214, 244);

            ToolStripMenuItem miUndo = new ToolStripMenuItem("&Undo", null, (s, e) => editorTextBox.Undo(), Keys.Control | Keys.Z);
            ToolStripMenuItem miRedo = new ToolStripMenuItem("&Redo", null, (s, e) => editorTextBox.Redo(), Keys.Control | Keys.Y);
            ToolStripSeparator sepEdit1 = new ToolStripSeparator();
            ToolStripMenuItem miCut = new ToolStripMenuItem("Cu&t", null, (s, e) => editorTextBox.Cut(), Keys.Control | Keys.X);
            ToolStripMenuItem miCopy = new ToolStripMenuItem("&Copy", null, (s, e) => editorTextBox.Copy(), Keys.Control | Keys.C);
            ToolStripMenuItem miPaste = new ToolStripMenuItem("&Paste", null, (s, e) => editorTextBox.Paste(), Keys.Control | Keys.V);
            ToolStripMenuItem miSelectAll = new ToolStripMenuItem("Select &All", null, (s, e) => editorTextBox.SelectAll(), Keys.Control | Keys.A);
            ToolStripSeparator sepEdit2 = new ToolStripSeparator();
            ToolStripMenuItem miClearShell = new ToolStripMenuItem("Clear &Shell Output", null, (s, e) => ClearShell(), Keys.Control | Keys.L);

            editMenu.DropDownItems.AddRange(new ToolStripItem[] { miUndo, miRedo, sepEdit1, miCut, miCopy, miPaste, miSelectAll, sepEdit2, miClearShell });

            // Run Menu
            ToolStripMenuItem runMenu = new ToolStripMenuItem("&Run");
            runMenu.ForeColor = Color.FromArgb(205, 214, 244);

            ToolStripMenuItem miRunModule = new ToolStripMenuItem("&Run Module", null, (s, e) => RunModule(), Keys.F5);
            ToolStripMenuItem miCheckSyntax = new ToolStripMenuItem("&Check Syntax", null, (s, e) => CheckSyntax(), Keys.Alt | Keys.X);
            ToolStripMenuItem miStop = new ToolStripMenuItem("&Stop Execution", null, (s, e) => StopExecution(), Keys.Control | Keys.Pause);
            ToolStripSeparator sepRun1 = new ToolStripSeparator();
            ToolStripMenuItem miRestartShell = new ToolStripMenuItem("Restart &Interactive Shell", null, (s, e) => RestartShell());

            runMenu.DropDownItems.AddRange(new ToolStripItem[] { miRunModule, miCheckSyntax, miStop, sepRun1, miRestartShell });

            // Cybersecurity Snippets Menu
            ToolStripMenuItem cyberMenu = new ToolStripMenuItem("&Cybersecurity");
            cyberMenu.ForeColor = Color.FromArgb(205, 214, 244);

            ToolStripMenuItem miScanSnip = new ToolStripMenuItem("Insert &TCP Port Scanner", null, (s, e) => InsertSnippet(
                "# Network Reconnaissance with PLAIN\nimport cyber\nports = [21, 22, 80, 443, 8080, 8443]\nsay \"Scanning 127.0.0.1 for open ports...\"\nopen_ports = cyber.port_scan(\"127.0.0.1\", ports)\nsay \"Open Ports Found: \" + str(open_ports)\n"
            ));
            ToolStripMenuItem miAuditSnip = new ToolStripMenuItem("Insert &HTTP Security Audit", null, (s, e) => InsertSnippet(
                "# Web Security Header Audit\nimport cyber\nreport = cyber.audit_security_headers(\"https://google.com\")\nsay \"Target: \" + report.url\nsay \"Score:  \" + str(report.score) + \"/100 (Grade: \" + report.grade + \")\"\n"
            ));
            ToolStripMenuItem miCveSnip = new ToolStripMenuItem("Insert &Offline CVE Threat Lookup", null, (s, e) => InsertSnippet(
                "# Offline Threat Intelligence Lookup\nimport cyber\nintel = cyber.cve_lookup(\"CVE-2021-44228\")\nsay \"CVE:         \" + intel.id\nsay \"Title:       \" + intel.title\nsay \"Severity:    \" + intel.severity\nsay \"Remediation: \" + intel.remediation\n"
            ));

            cyberMenu.DropDownItems.AddRange(new ToolStripItem[] { miScanSnip, miAuditSnip, miCveSnip });

            // Help Menu
            ToolStripMenuItem helpMenu = new ToolStripMenuItem("&Help");
            helpMenu.ForeColor = Color.FromArgb(205, 214, 244);

            ToolStripMenuItem miAbout = new ToolStripMenuItem("&About PLAIN IDE", null, (s, e) => ShowAboutDialog());
            ToolStripMenuItem miDocs = new ToolStripMenuItem("PLAIN &Language Reference", null, (s, e) => ShowDocsDialog());

            helpMenu.DropDownItems.AddRange(new ToolStripItem[] { miAbout, miDocs });

            menuStrip.Items.AddRange(new ToolStripItem[] { fileMenu, editMenu, runMenu, cyberMenu, helpMenu });

            // 2. ToolStrip
            toolStrip = new ToolStrip();
            toolStrip.BackColor = Color.FromArgb(30, 30, 46);
            toolStrip.ForeColor = Color.FromArgb(205, 214, 244);
            toolStrip.GripStyle = ToolStripGripStyle.Hidden;
            toolStrip.Font = new Font("Segoe UI", 9F);
            toolStrip.Padding = new Padding(6, 2, 6, 2);

            btnNew = new ToolStripButton("📄 New", null, (s, e) => NewFile());
            btnOpen = new ToolStripButton("📂 Open", null, (s, e) => OpenFileDialogPrompt());
            btnSave = new ToolStripButton("💾 Save", null, (s, e) => SaveFile());
            ToolStripSeparator sepTool1 = new ToolStripSeparator();
            btnRun = new ToolStripButton("▶ Run Module (F5)", null, (s, e) => RunModule());
            btnRun.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            btnRun.ForeColor = Color.FromArgb(166, 227, 161); // IDLE Green
            btnStop = new ToolStripButton("⏹ Stop", null, (s, e) => StopExecution());
            btnStop.ForeColor = Color.FromArgb(243, 139, 168);
            ToolStripSeparator sepTool2 = new ToolStripSeparator();
            btnClear = new ToolStripButton("🧹 Clear Shell", null, (s, e) => ClearShell());
            ToolStripSeparator sepTool3 = new ToolStripSeparator();
            btnHelp = new ToolStripButton("ℹ️ About", null, (s, e) => ShowAboutDialog());

            toolStrip.Items.AddRange(new ToolStripItem[] { btnNew, btnOpen, btnSave, sepTool1, btnRun, btnStop, sepTool2, btnClear, sepTool3, btnHelp });

            // 3. SplitContainer
            splitContainer = new SplitContainer();
            splitContainer.Dock = DockStyle.Fill;
            splitContainer.Orientation = Orientation.Horizontal;
            splitContainer.SplitterDistance = 400;
            splitContainer.SplitterWidth = 6;
            splitContainer.BackColor = Color.FromArgb(49, 50, 68);

            // Editor TextBox (Top)
            editorTextBox = new RichTextBox();
            editorTextBox.Dock = DockStyle.Fill;
            editorTextBox.BackColor = Color.FromArgb(17, 17, 27);
            editorTextBox.ForeColor = Color.FromArgb(205, 214, 244);
            editorTextBox.Font = new Font("Consolas", 11.5F);
            editorTextBox.BorderStyle = BorderStyle.None;
            editorTextBox.AcceptsTab = true;
            editorTextBox.WordWrap = false;
            editorTextBox.ScrollBars = RichTextBoxScrollBars.Both;
            editorTextBox.TextChanged += (s, e) => {
                if (!isModified)
                {
                    isModified = true;
                    UpdateWindowTitle();
                }
            };
            editorTextBox.SelectionChanged += (s, e) => UpdateCursorPosition();

            // Shell Area (Bottom Panel)
            Panel shellContainer = new Panel();
            shellContainer.Dock = DockStyle.Fill;
            shellContainer.BackColor = Color.FromArgb(17, 17, 27);

            shellTextBox = new RichTextBox();
            shellTextBox.Dock = DockStyle.Fill;
            shellTextBox.BackColor = Color.FromArgb(10, 10, 18);
            shellTextBox.ForeColor = Color.FromArgb(166, 227, 161);
            shellTextBox.Font = new Font("Consolas", 10.5F);
            shellTextBox.BorderStyle = BorderStyle.None;
            shellTextBox.ReadOnly = true;
            shellTextBox.WordWrap = true;
            shellTextBox.ScrollBars = RichTextBoxScrollBars.Vertical;

            // Interactive Input Bar at bottom of shell
            interactivePanel = new Panel();
            interactivePanel.Dock = DockStyle.Bottom;
            interactivePanel.Height = 32;
            interactivePanel.BackColor = Color.FromArgb(24, 24, 37);
            interactivePanel.Padding = new Padding(4, 4, 4, 4);

            promptLabel = new Label();
            promptLabel.Text = ">>>";
            promptLabel.Font = new Font("Consolas", 10.5F, FontStyle.Bold);
            promptLabel.ForeColor = Color.FromArgb(137, 180, 250);
            promptLabel.Width = 36;
            promptLabel.Dock = DockStyle.Left;
            promptLabel.TextAlign = ContentAlignment.MiddleCenter;

            interactiveRunButton = new Button();
            interactiveRunButton.Text = "Execute";
            interactiveRunButton.Dock = DockStyle.Right;
            interactiveRunButton.Width = 75;
            interactiveRunButton.FlatStyle = FlatStyle.Flat;
            interactiveRunButton.FlatAppearance.BorderColor = Color.FromArgb(69, 71, 90);
            interactiveRunButton.BackColor = Color.FromArgb(30, 30, 46);
            interactiveRunButton.ForeColor = Color.FromArgb(166, 227, 161);
            interactiveRunButton.Font = new Font("Segoe UI", 8.5F);
            interactiveRunButton.Click += (s, e) => ExecuteInteractiveCommand();

            interactiveInputBox = new TextBox();
            interactiveInputBox.Dock = DockStyle.Fill;
            interactiveInputBox.BackColor = Color.FromArgb(30, 30, 46);
            interactiveInputBox.ForeColor = Color.FromArgb(245, 224, 220);
            interactiveInputBox.Font = new Font("Consolas", 10F);
            interactiveInputBox.BorderStyle = BorderStyle.FixedSingle;
            interactiveInputBox.KeyDown += (s, e) => {
                if (e.KeyCode == Keys.Enter)
                {
                    e.SuppressKeyPress = true;
                    ExecuteInteractiveCommand();
                }
            };

            interactivePanel.Controls.Add(interactiveInputBox);
            interactivePanel.Controls.Add(promptLabel);
            interactivePanel.Controls.Add(interactiveRunButton);

            shellContainer.Controls.Add(shellTextBox);
            shellContainer.Controls.Add(interactivePanel);

            splitContainer.Panel1.Controls.Add(editorTextBox);
            splitContainer.Panel2.Controls.Add(shellContainer);

            // 4. StatusStrip
            statusStrip = new StatusStrip();
            statusStrip.BackColor = Color.FromArgb(30, 30, 46);
            statusStrip.ForeColor = Color.FromArgb(166, 173, 200);
            statusStrip.Font = new Font("Segoe UI", 9F);

            statusFileLabel = new ToolStripStatusLabel("Untitled");
            statusFileLabel.Spring = true;
            statusFileLabel.TextAlign = ContentAlignment.MiddleLeft;

            statusCursorLabel = new ToolStripStatusLabel("Ln: 1, Col: 1");
            statusCursorLabel.Width = 140;

            statusAuthorLabel = new ToolStripStatusLabel("PLAIN v1.2.0 (F5 to Run)");
            statusAuthorLabel.ForeColor = Color.FromArgb(137, 180, 250);

            statusStrip.Items.AddRange(new ToolStripItem[] { statusFileLabel, statusCursorLabel, statusAuthorLabel });

            // Add all to Form
            this.Controls.Add(splitContainer);
            this.Controls.Add(toolStrip);
            this.Controls.Add(menuStrip);
            this.Controls.Add(statusStrip);
            this.MainMenuStrip = menuStrip;
        }

        private void PlainIdeForm_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.F5)
            {
                e.Handled = true;
                RunModule();
            }
        }

        private void PlainIdeForm_DragEnter(object sender, DragEventArgs e)
        {
            if (e.Data.GetDataPresent(DataFormats.FileDrop))
            {
                e.Effect = DragDropEffects.Copy;
            }
        }

        private void PlainIdeForm_DragDrop(object sender, DragEventArgs e)
        {
            string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
            if (files != null && files.Length > 0 && File.Exists(files[0]))
            {
                // CRITICAL REQUIREMENT: Load into code-writing area ONLY. DO NOT RUN.
                OpenFile(files[0]);
            }
        }

        private void UpdateCursorPosition()
        {
            int index = editorTextBox.SelectionStart;
            int line = editorTextBox.GetLineFromCharIndex(index) + 1;
            int col = index - editorTextBox.GetFirstCharIndexOfCurrentLine() + 1;
            statusCursorLabel.Text = string.Format("Ln: {0}, Col: {1}", line, col);
        }

        private void UpdateWindowTitle()
        {
            string docName = string.IsNullOrEmpty(currentFilePath) ? "Untitled" : Path.GetFileName(currentFilePath);
            string modMarker = isModified ? "*" : "";
            this.Text = string.Format("{0}{1} - PLAIN IDE", modMarker, docName);
            statusFileLabel.Text = string.IsNullOrEmpty(currentFilePath) ? "Untitled (unsaved)" : currentFilePath;
        }

        private void PrintShellBanner()
        {
            shellTextBox.Clear();
            AppendShellText("PLAIN 1.2.0 Interactive Shell\n", Color.FromArgb(137, 180, 250), true);
            AppendShellText("Press F5 or click 'Run Module' to execute code. Type one-liners in '>>>' below.\n", Color.FromArgb(147, 153, 178), false);
            AppendShellText(new string('-', 68) + "\n\n", Color.FromArgb(69, 71, 90), false);
        }

        private void AppendShellText(string text, Color color, bool bold)
        {
            if (shellTextBox.InvokeRequired)
            {
                shellTextBox.Invoke(new Action<string, Color, bool>(AppendShellText), text, color, bold);
                return;
            }

            shellTextBox.SelectionStart = shellTextBox.TextLength;
            shellTextBox.SelectionLength = 0;
            shellTextBox.SelectionColor = color;
            shellTextBox.SelectionFont = new Font(shellTextBox.Font, bold ? FontStyle.Bold : FontStyle.Regular);
            shellTextBox.AppendText(text);
            shellTextBox.SelectionColor = shellTextBox.ForeColor;
            shellTextBox.ScrollToCaret();
        }

        // --- File Operations ---

        private void NewFile()
        {
            if (PromptSaveIfModified())
            {
                currentFilePath = null;
                editorTextBox.Text = "# PLAIN Program\nSet ABC = Main\n\nx = 10\ny = 25\nsay \"Calculation Result: \" + str((x + y) * 2)\nsay \"Ready for AI, Web Servers & Cybersecurity!\"\n";
                isModified = false;
                UpdateWindowTitle();
                editorTextBox.SelectionStart = 0;
                editorTextBox.SelectionLength = 0;
            }
        }

        private void OpenFileDialogPrompt()
        {
            if (!PromptSaveIfModified()) return;

            using (OpenFileDialog ofd = new OpenFileDialog())
            {
                ofd.Filter = "PLAIN Files (*.plain)|*.plain|Text Files (*.txt)|*.txt|All Files (*.*)|*.*";
                ofd.Title = "Open PLAIN Source File (Loads into Editor Only)";
                if (ofd.ShowDialog() == DialogResult.OK)
                {
                    OpenFile(ofd.FileName);
                }
            }
        }

        public void OpenFile(string filePath)
        {
            try
            {
                // Read with Utf8NoBom and strip any existing BOM
                string content = File.ReadAllText(filePath, Utf8NoBom);
                if (content.Length > 0 && content[0] == '\uFEFF')
                {
                    content = content.Substring(1);
                }

                currentFilePath = Path.GetFullPath(filePath);
                
                // CRITICAL REQUIREMENT: Load into code-writing area ONLY. DO NOT RUN.
                editorTextBox.Text = content;
                isModified = false;
                UpdateWindowTitle();
                editorTextBox.SelectionStart = 0;
                editorTextBox.SelectionLength = 0;

                AppendShellText(string.Format("[Loaded: {0} into editor area]\n", Path.GetFileName(filePath)), Color.FromArgb(147, 153, 178), false);
            }
            catch (Exception ex)
            {
                MessageBox.Show(string.Format("Failed to open file:\n{0}", ex.Message), "Open Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private bool SaveFile()
        {
            if (string.IsNullOrEmpty(currentFilePath))
            {
                return SaveFileAs();
            }

            try
            {
                // Write clean UTF-8 WITHOUT BOM
                File.WriteAllText(currentFilePath, editorTextBox.Text, Utf8NoBom);
                isModified = false;
                UpdateWindowTitle();
                return true;
            }
            catch (Exception ex)
            {
                MessageBox.Show(string.Format("Failed to save file:\n{0}", ex.Message), "Save Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return false;
            }
        }

        private bool SaveFileAs()
        {
            using (SaveFileDialog sfd = new SaveFileDialog())
            {
                sfd.Filter = "PLAIN Files (*.plain)|*.plain|Text Files (*.txt)|*.txt|All Files (*.*)|*.*";
                sfd.DefaultExt = "plain";
                sfd.Title = "Save PLAIN Source File";
                if (sfd.ShowDialog() == DialogResult.OK)
                {
                    currentFilePath = Path.GetFullPath(sfd.FileName);
                    return SaveFile();
                }
            }
            return false;
        }

        private bool PromptSaveIfModified()
        {
            if (!isModified) return true;

            DialogResult dr = MessageBox.Show(
                "The current file has unsaved changes.\nDo you want to save before proceeding?",
                "Unsaved Changes",
                MessageBoxButtons.YesNoCancel,
                MessageBoxIcon.Question
            );

            if (dr == DialogResult.Yes)
            {
                return SaveFile();
            }
            if (dr == DialogResult.No)
            {
                return true;
            }
            return false; // Cancel
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            if (!PromptSaveIfModified())
            {
                e.Cancel = true;
                return;
            }

            StopExecution();
            base.OnFormClosing(e);
        }

        // --- Execution Operations ---

        private void RunModule()
        {
            // Python IDLE behavior: Save before running
            if (string.IsNullOrEmpty(currentFilePath) || isModified)
            {
                if (!SaveFile()) return;
            }
            else
            {
                // Ensure file on disk has no BOM
                try
                {
                    File.WriteAllText(currentFilePath, editorTextBox.Text, Utf8NoBom);
                }
                catch { }
            }

            StopExecution();

            string fileName = Path.GetFileName(currentFilePath);
            AppendShellText(string.Format("\n======================== RESTART: {0} ========================\n", currentFilePath), Color.FromArgb(137, 180, 250), true);

            ExecutePlainProcess(string.Format("\"{0}\"", currentFilePath));
        }

        private void CheckSyntax()
        {
            if (string.IsNullOrEmpty(currentFilePath) || isModified)
            {
                if (!SaveFile()) return;
            }

            AppendShellText(string.Format("\n[Checking syntax for {0}...]\n", Path.GetFileName(currentFilePath)), Color.FromArgb(137, 180, 250), false);
            ExecutePlainProcess(string.Format("check \"{0}\"", currentFilePath));
        }

        private void ExecuteInteractiveCommand()
        {
            string cmd = interactiveInputBox.Text.Trim();
            if (string.IsNullOrEmpty(cmd)) return;

            interactiveInputBox.Clear();
            AppendShellText(string.Format("\n>>> {0}\n", cmd), Color.FromArgb(245, 224, 220), true);

            // Escape command for -e
            string escaped = cmd.Replace("\"", "\\\"");
            ExecutePlainProcess(string.Format("-e \"{0}\"", escaped));
        }

        private void ExecutePlainProcess(string arguments)
        {
            try
            {
                string plainExecutable = LocatePlainCommand();

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = plainExecutable;
                psi.Arguments = arguments;
                psi.UseShellExecute = false;
                psi.RedirectStandardOutput = true;
                psi.RedirectStandardError = true;
                psi.CreateNoWindow = true;
                psi.WorkingDirectory = string.IsNullOrEmpty(currentFilePath) ? Environment.CurrentDirectory : Path.GetDirectoryName(currentFilePath);

                activeProcess = new Process();
                activeProcess.StartInfo = psi;
                activeProcess.EnableRaisingEvents = true;

                activeProcess.OutputDataReceived += (s, e) => {
                    if (e.Data != null)
                    {
                        AppendShellText(e.Data + "\n", Color.FromArgb(205, 214, 244), false);
                    }
                };

                activeProcess.ErrorDataReceived += (s, e) => {
                    if (e.Data != null)
                    {
                        AppendShellText(e.Data + "\n", Color.FromArgb(243, 139, 168), false);
                    }
                };

                activeProcess.Exited += (s, e) => {
                    AppendShellText(">>> ", Color.FromArgb(137, 180, 250), true);
                    activeProcess = null;
                };

                activeProcess.Start();
                activeProcess.BeginOutputReadLine();
                activeProcess.BeginErrorReadLine();
            }
            catch (Exception ex)
            {
                AppendShellText(string.Format("Execution error: {0}\n>>> ", ex.Message), Color.FromArgb(243, 139, 168), false);
            }
        }

        private string LocatePlainCommand()
        {
            // Priority 1: Check Local AppData PLAIN bin
            string localPlainCmd = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "PLAIN", "bin", "plain.cmd");
            if (File.Exists(localPlainCmd)) return localPlainCmd;

            string localPlainExe = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "PLAIN", "bin", "plain.exe");
            if (File.Exists(localPlainExe)) return localPlainExe;

            // Priority 2: Check current workspace dist
            string workspacePlainCmd = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "bin", "plain.cmd");
            if (File.Exists(workspacePlainCmd)) return workspacePlainCmd;

            // Fallback to system command
            return "plain.cmd";
        }

        private void StopExecution()
        {
            if (activeProcess != null && !activeProcess.HasExited)
            {
                try
                {
                    activeProcess.Kill();
                    AppendShellText("\n[Process terminated by user]\n>>> ", Color.FromArgb(243, 139, 168), true);
                }
                catch { }
                activeProcess = null;
            }
        }

        private void ClearShell()
        {
            PrintShellBanner();
        }

        private void RestartShell()
        {
            StopExecution();
            PrintShellBanner();
        }

        private void InsertSnippet(string code)
        {
            editorTextBox.SelectedText = code;
        }

        // --- Dialogs ---

        private void ShowAboutDialog()
        {
            string msg = "PLAIN IDE — Version 1.2.0\n\n" +
                         "A modern, focused desktop environment for the PLAIN programming language.\n\n" +
                         "Features:\n" +
                         " • 1,300+ Standard Library Functions\n" +
                         " • Native Code Editor & IDLE Interactive Shell\n" +
                         " • AI Deep Learning & Neural Network Training\n" +
                         " • Live Network Web Server Deployment\n" +
                         " • Built-In Cybersecurity & Threat Intelligence\n" +
                         " • Standard Operators (+, -, *, /, =, **, //)\n\n" +
                         "Website: https://reuben123t.github.io/plain-lang/";

            MessageBox.Show(msg, "About PLAIN IDE", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void ShowDocsDialog()
        {
            string msg = "PLAIN Quick Language Reference\n\n" +
                         "1. Variables & Assignment:\n" +
                         "   Set ABC = Main\n" +
                         "   x = 10\n" +
                         "   y = 20\n\n" +
                         "2. Mathematics:\n" +
                         "   total = (x + y) * 2 - 5 / 2\n" +
                         "   power = 2 ** 8\n" +
                         "   floor = 17 // 3\n\n" +
                         "3. Output:\n" +
                         "   say \"Hello from PLAIN!\"\n\n" +
                         "4. AI Neural Network:\n" +
                         "   nn = neural_network([2, 4, 1])\n" +
                         "   train_ai(nn, data, targets, 100)\n\n" +
                         "5. Cybersecurity:\n" +
                         "   cyber.port_scan(\"127.0.0.1\", [80, 443])\n" +
                         "   cyber.audit_security_headers(\"https://google.com\")\n" +
                         "   cyber.cve_lookup(\"CVE-2021-44228\")\n\n" +
                         "Keyboard Shortcuts:\n" +
                         " • F5: Run Module in Shell\n" +
                         " • Ctrl+N: New Window\n" +
                         " • Ctrl+O: Open File into Editor (Does NOT run)\n" +
                         " • Ctrl+S: Save File\n" +
                         " • Ctrl+L: Clear Shell Output";

            MessageBox.Show(msg, "PLAIN Language Reference", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }
}
