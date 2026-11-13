using System;
using System.IO;
using System.Text;
using System.Drawing;
using System.Diagnostics;
using System.Windows.Forms;
using System.Collections.Generic;

[assembly: System.Reflection.AssemblyTitle("PLAIN Code Studio")]
[assembly: System.Reflection.AssemblyDescription("Modern VS Code-Style Development Environment for PLAIN and Multi-Language Projects")]
[assembly: System.Reflection.AssemblyCompany("PLAIN Language Foundation")]
[assembly: System.Reflection.AssemblyProduct("PLAIN Code Studio")]
[assembly: System.Reflection.AssemblyCopyright("Copyright © 2026 PLAIN")]
[assembly: System.Reflection.AssemblyVersion("1.3.0.0")]
[assembly: System.Reflection.AssemblyFileVersion("1.3.0.0")]

namespace PlainIde
{
    // Representation of an Open File Tab
    public class EditorTab
    {
        public string FilePath;
        public string Title;
        public bool IsModified;
        public string Language;
        public RichTextBox Editor;
        public Button TabButton;
    }

    // Autocomplete Suggestion Item
    public class SuggestionItem
    {
        public string Text;
        public string DisplayText;
        public string Kind; // fn, kw, var, snip
        public string Description;

        public SuggestionItem(string text, string kind, string desc = "")
        {
            Text = text;
            DisplayText = text;
            Kind = kind;
            Description = desc;
        }

        public override string ToString()
        {
            return string.Format("[{0}] {1}", Kind, DisplayText);
        }
    }

    public class PlainIdeForm : Form
    {
        private static readonly Encoding Utf8NoBom = new UTF8Encoding(false);

        // State
        private List<EditorTab> openTabs = new List<EditorTab>();
        private EditorTab activeTab = null;
        private Process activeProcess = null;
        private string currentWorkspaceDir = null;

        // Autocomplete Engine
        private Form popupForm;
        private ListBox suggestionListBox;
        private Label suggestionDescLabel;
        private List<SuggestionItem> masterDict = new List<SuggestionItem>();
        private string currentPrefix = "";
        private int prefixStartPos = 0;
        private bool isUpdatingText = false;

        // UI Controls - Layout
        private MenuStrip menuStrip;
        private StatusStrip statusStrip;
        private SplitContainer mainSplitter;      // Left (Activity+Sidebar) vs Right (Editor+Terminal)
        private SplitContainer editorSplitter;    // Top (Tabs+Editor) vs Bottom (Terminal Panel)
        private Panel activityBar;
        private Panel sidebarPanel;
        private Label sidebarHeaderLabel;
        private TreeView fileTreeView;
        private ListBox snippetsListBox;
        private ListBox cyberToolbox;
        private FlowLayoutPanel tabStripPanel;
        private Panel editorHostPanel;
        private Panel lineGutter;

        // Terminal Panel Controls
        private Panel terminalTabStrip;
        private Button btnTermTerminal;
        private Button btnTermOutput;
        private Button btnTermShell;
        private RichTextBox terminalTextBox;
        private Panel interactiveInputPanel;
        private TextBox interactiveInputBox;
        private Button interactiveExecuteBtn;

        // Status Bar Labels
        private ToolStripStatusLabel statusGitBranch;
        private ToolStripStatusLabel statusCursorPos;
        private ToolStripStatusLabel statusEncoding;
        private ToolStripStatusLabel statusSpaces;
        private ToolStripStatusLabel statusLanguage;
        private ToolStripStatusLabel statusRunState;

        // Theme Colors (VS Code Dark Modern / Dark+ Palette)
        private readonly Color ColorActivityBg   = Color.FromArgb(40, 40, 42);
        private readonly Color ColorSidebarBg    = Color.FromArgb(30, 30, 32);
        private readonly Color ColorEditorBg     = Color.FromArgb(24, 24, 26);
        private readonly Color ColorGutterBg     = Color.FromArgb(24, 24, 26);
        private readonly Color ColorGutterText   = Color.FromArgb(120, 120, 130);
        private readonly Color ColorTabActiveBg  = Color.FromArgb(24, 24, 26);
        private readonly Color ColorTabInactBg   = Color.FromArgb(37, 37, 38);
        private readonly Color ColorTabStripBg   = Color.FromArgb(30, 30, 32);
        private readonly Color ColorTerminalBg   = Color.FromArgb(18, 18, 20);
        private readonly Color ColorStatusBg     = Color.FromArgb(0, 122, 204);   // VS Code Blue
        private readonly Color ColorStatusText   = Color.White;
        private readonly Color ColorTextNormal   = Color.FromArgb(220, 220, 225);
        private readonly Color ColorAccentCyan   = Color.FromArgb(56, 189, 248);
        private readonly Color ColorAccentGreen  = Color.FromArgb(52, 211, 153);
        private readonly Color ColorBorder       = Color.FromArgb(50, 50, 55);

        [STAThread]
        public static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string initialFile = null;
            if (args != null && args.Length > 0 && !string.IsNullOrEmpty(args[0]))
            {
                string candidate = args[0].Trim('"', ' ');
                if (File.Exists(candidate))
                {
                    initialFile = Path.GetFullPath(candidate);
                }
            }

            Application.Run(new PlainIdeForm(initialFile));
        }

        public PlainIdeForm(string initialFilePath)
        {
            InitializeMasterDictionary();
            InitializeComponent();
            SetupAutocompletePopup();

            // Set Workspace Directory
            if (!string.IsNullOrEmpty(initialFilePath) && File.Exists(initialFilePath))
            {
                currentWorkspaceDir = Path.GetDirectoryName(initialFilePath);
                OpenFileInTab(initialFilePath);
            }
            else
            {
                currentWorkspaceDir = Environment.CurrentDirectory;
                CreateNewTab("Untitled-1.plain", "# PLAIN Program\nSet ABC = Main\n\nx = 100\ny = 25\nsay \"Calculation Result: \" + str((x + y) * 2)\nsay \"Ready for AI, Web Servers & Cybersecurity!\"\n");
            }

            PopulateFileTree(currentWorkspaceDir);
            PrintTerminalBanner();
        }

        // --- Master Autocomplete Dictionary Initialization ---
        private void InitializeMasterDictionary()
        {
            // 1. PLAIN Builtins & Keywords
            masterDict.Add(new SuggestionItem("say", "fn", "say <expression> - Output text to console"));
            masterDict.Add(new SuggestionItem("Set ABC = Main", "snip", "Set ABC = Main - Variable symbol assignment"));
            masterDict.Add(new SuggestionItem("neural_network", "fn", "neural_network(layers, lr) - Create deep MLP network"));
            masterDict.Add(new SuggestionItem("train_ai", "fn", "train_ai(network, data, targets, epochs) - Train AI model"));
            masterDict.Add(new SuggestionItem("predict_ai", "fn", "predict_ai(network, input) - AI inference"));
            masterDict.Add(new SuggestionItem("web_server", "fn", "web_server(port, host) - Create HTTP web server"));
            masterDict.Add(new SuggestionItem("route", "fn", "route(server, method, path, handler) - Register web route"));
            masterDict.Add(new SuggestionItem("json_response", "fn", "json_response(data) - Return HTTP JSON"));
            masterDict.Add(new SuggestionItem("start_server", "fn", "start_server(server) - Start listening on port"));

            // 2. Cybersecurity Tools
            masterDict.Add(new SuggestionItem("cyber.port_scan", "fn", "cyber.port_scan(host, ports) - Multi-threaded TCP recon"));
            masterDict.Add(new SuggestionItem("cyber.audit_security_headers", "fn", "cyber.audit_security_headers(url) - Audit CSP, HSTS, CORS"));
            masterDict.Add(new SuggestionItem("cyber.cve_lookup", "fn", "cyber.cve_lookup(cve_id) - Offline CVE threat intelligence"));
            masterDict.Add(new SuggestionItem("cyber.detect_sql_injection", "fn", "cyber.detect_sql_injection(input) - Scan for SQLi payloads"));
            masterDict.Add(new SuggestionItem("cyber.detect_xss", "fn", "cyber.detect_xss(input) - Scan for XSS scripts"));
            masterDict.Add(new SuggestionItem("cyber.calculate_entropy", "fn", "cyber.calculate_entropy(data) - Shannon entropy for malware"));
            masterDict.Add(new SuggestionItem("cyber.subnet_calculator", "fn", "cyber.subnet_calculator(cidr) - Calculate IPv4 network range"));
            masterDict.Add(new SuggestionItem("cyber.check_password_strength", "fn", "cyber.check_password_strength(pwd) - Password entropy & breach audit"));

            // 3. Pythonic Type Converters & Standard Functions
            masterDict.Add(new SuggestionItem("str", "fn", "str(val) - Convert to string"));
            masterDict.Add(new SuggestionItem("int", "fn", "int(val) - Convert to integer"));
            masterDict.Add(new SuggestionItem("float", "fn", "float(val) - Convert to floating-point number"));
            masterDict.Add(new SuggestionItem("bool", "fn", "bool(val) - Convert to boolean"));
            masterDict.Add(new SuggestionItem("type", "fn", "type(val) - Return runtime type name"));
            masterDict.Add(new SuggestionItem("len", "fn", "len(val) - Return length of list or string"));

            // 4. Multi-Language Keywords: Python, JS, HTML, General
            string[] commonKw = new string[] {
                "if", "then", "otherwise", "else", "elif", "repeat", "while", "for", "each", "in", "def", "return", "end",
                "import", "from", "as", "class", "print", "range", "enumerate", "open", "try", "except", "finally", "with",
                "function", "const", "let", "var", "async", "await", "export", "console.log", "document.getElementById", "fetch",
                "json", "math", "cyber", "system", "time", "network"
            };
            foreach (string kw in commonKw)
            {
                masterDict.Add(new SuggestionItem(kw, "kw", "Language keyword"));
            }
        }

        private void InitializeComponent()
        {
            this.Text = "PLAIN Code Studio";
            this.Size = new Size(1200, 800);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = ColorEditorBg;
            this.ForeColor = ColorTextNormal;
            this.KeyPreview = true;
            this.KeyDown += PlainIdeForm_KeyDown;
            this.AllowDrop = true;
            this.DragEnter += (s, e) => { if (e.Data.GetDataPresent(DataFormats.FileDrop)) e.Effect = DragDropEffects.Copy; };
            this.DragDrop += PlainIdeForm_DragDrop;

            // Load Custom Logo Icon
            try
            {
                string appDir = Path.GetDirectoryName(Application.ExecutablePath);
                string ico1 = Path.Combine(appDir, "plain.ico");
                string ico2 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "PLAIN", "bin", "plain.ico");
                if (File.Exists(ico1)) this.Icon = new Icon(ico1);
                else if (File.Exists(ico2)) this.Icon = new Icon(ico2);
                else { Icon ex = Icon.ExtractAssociatedIcon(Application.ExecutablePath); if (ex != null) this.Icon = ex; }
            }
            catch { }

            // 1. Menu Bar (VS Code Style)
            menuStrip = new MenuStrip();
            menuStrip.BackColor = ColorActivityBg;
            menuStrip.ForeColor = ColorTextNormal;
            menuStrip.Font = new Font("Segoe UI", 9F);
            menuStrip.Renderer = new ToolStripProfessionalRenderer(new VsCodeColorTable());

            BuildMenus();

            // 2. Status Strip (VS Code Blue Accent)
            statusStrip = new StatusStrip();
            statusStrip.BackColor = ColorStatusBg;
            statusStrip.ForeColor = ColorStatusText;
            statusStrip.Font = new Font("Segoe UI", 9F);

            statusGitBranch = new ToolStripStatusLabel(" main");
            statusGitBranch.Padding = new Padding(8, 0, 8, 0);

            statusCursorPos = new ToolStripStatusLabel("Ln 1, Col 1");
            statusCursorPos.Padding = new Padding(8, 0, 8, 0);

            statusSpaces = new ToolStripStatusLabel("Spaces: 4");
            statusSpaces.Padding = new Padding(8, 0, 8, 0);

            statusEncoding = new ToolStripStatusLabel("UTF-8");
            statusEncoding.Padding = new Padding(8, 0, 8, 0);

            statusLanguage = new ToolStripStatusLabel("PLAIN");
            statusLanguage.Padding = new Padding(8, 0, 8, 0);
            statusLanguage.Font = new Font("Segoe UI", 9F, FontStyle.Bold);

            statusRunState = new ToolStripStatusLabel("F5: Run Module");
            statusRunState.Spring = true;
            statusRunState.TextAlign = ContentAlignment.MiddleRight;
            statusRunState.Padding = new Padding(0, 0, 12, 0);

            statusStrip.Items.AddRange(new ToolStripItem[] {
                statusGitBranch, statusCursorPos, statusSpaces, statusEncoding, statusLanguage, statusRunState
            });

            // 3. Layout Splitters
            mainSplitter = new SplitContainer();
            mainSplitter.Dock = DockStyle.Fill;
            mainSplitter.Orientation = Orientation.Vertical;
            mainSplitter.SplitterDistance = 260;
            mainSplitter.SplitterWidth = 3;
            mainSplitter.BackColor = ColorBorder;

            // Left Pane: Activity Bar (48px) + Sidebar (Collapsible)
            Panel leftContainer = new Panel();
            leftContainer.Dock = DockStyle.Fill;
            leftContainer.BackColor = ColorSidebarBg;

            activityBar = new Panel();
            activityBar.Dock = DockStyle.Left;
            activityBar.Width = 46;
            activityBar.BackColor = ColorActivityBg;

            sidebarPanel = new Panel();
            sidebarPanel.Dock = DockStyle.Fill;
            sidebarPanel.BackColor = ColorSidebarBg;

            BuildActivityBar();
            BuildSidebarViews();

            leftContainer.Controls.Add(sidebarPanel);
            leftContainer.Controls.Add(activityBar);
            mainSplitter.Panel1.Controls.Add(leftContainer);

            // Right Pane: Editor Splitter (Top: Tabs & Editor, Bottom: Terminal)
            editorSplitter = new SplitContainer();
            editorSplitter.Dock = DockStyle.Fill;
            editorSplitter.Orientation = Orientation.Horizontal;
            editorSplitter.SplitterDistance = 490;
            editorSplitter.SplitterWidth = 4;
            editorSplitter.BackColor = ColorBorder;

            // Editor Area
            Panel editorTopContainer = new Panel();
            editorTopContainer.Dock = DockStyle.Fill;
            editorTopContainer.BackColor = ColorEditorBg;

            tabStripPanel = new FlowLayoutPanel();
            tabStripPanel.Dock = DockStyle.Top;
            tabStripPanel.Height = 35;
            tabStripPanel.BackColor = ColorTabStripBg;
            tabStripPanel.WrapContents = false;
            tabStripPanel.AutoScroll = true;

            editorHostPanel = new Panel();
            editorHostPanel.Dock = DockStyle.Fill;
            editorHostPanel.BackColor = ColorEditorBg;

            lineGutter = new Panel();
            lineGutter.Dock = DockStyle.Left;
            lineGutter.Width = 44;
            lineGutter.BackColor = ColorGutterBg;
            lineGutter.Paint += LineGutter_Paint;

            editorTopContainer.Controls.Add(editorHostPanel);
            editorTopContainer.Controls.Add(tabStripPanel);
            editorSplitter.Panel1.Controls.Add(editorTopContainer);

            // Bottom Area: Terminal Panel
            Panel terminalContainer = new Panel();
            terminalContainer.Dock = DockStyle.Fill;
            terminalContainer.BackColor = ColorTerminalBg;

            BuildTerminalPanel(terminalContainer);
            editorSplitter.Panel2.Controls.Add(terminalContainer);

            mainSplitter.Panel2.Controls.Add(editorSplitter);

            // Assembly to Form
            this.Controls.Add(mainSplitter);
            this.Controls.Add(statusStrip);
            this.Controls.Add(menuStrip);
            this.MainMenuStrip = menuStrip;
        }

        // --- Autocomplete / IntelliSense Floating Popup Setup ---
        private void SetupAutocompletePopup()
        {
            popupForm = new Form();
            popupForm.FormBorderStyle = FormBorderStyle.None;
            popupForm.StartPosition = FormStartPosition.Manual;
            popupForm.ShowInTaskbar = false;
            popupForm.Size = new Size(320, 200);
            popupForm.BackColor = Color.FromArgb(37, 37, 38);
            popupForm.TopMost = true;

            Panel popupBorder = new Panel();
            popupBorder.Dock = DockStyle.Fill;
            popupBorder.Padding = new Padding(1);
            popupBorder.BackColor = Color.FromArgb(0, 122, 204); // VS Code Blue border

            Panel inner = new Panel();
            inner.Dock = DockStyle.Fill;
            inner.BackColor = Color.FromArgb(30, 30, 32);

            suggestionListBox = new ListBox();
            suggestionListBox.Dock = DockStyle.Fill;
            suggestionListBox.BackColor = Color.FromArgb(30, 30, 32);
            suggestionListBox.ForeColor = Color.FromArgb(220, 220, 225);
            suggestionListBox.Font = new Font("Consolas", 10F);
            suggestionListBox.BorderStyle = BorderStyle.None;
            suggestionListBox.ItemHeight = 22;
            suggestionListBox.DrawMode = DrawMode.OwnerDrawFixed;
            suggestionListBox.DrawItem += SuggestionListBox_DrawItem;
            suggestionListBox.KeyDown += SuggestionListBox_KeyDown;
            suggestionListBox.DoubleClick += (s, e) => AcceptSelectedSuggestion();
            suggestionListBox.SelectedIndexChanged += SuggestionListBox_SelectedIndexChanged;

            suggestionDescLabel = new Label();
            suggestionDescLabel.Dock = DockStyle.Bottom;
            suggestionDescLabel.Height = 44;
            suggestionDescLabel.BackColor = Color.FromArgb(24, 24, 26);
            suggestionDescLabel.ForeColor = Color.FromArgb(160, 160, 170);
            suggestionDescLabel.Font = new Font("Segoe UI", 8.5F);
            suggestionDescLabel.Padding = new Padding(6, 4, 6, 4);

            inner.Controls.Add(suggestionListBox);
            inner.Controls.Add(suggestionDescLabel);
            popupBorder.Controls.Add(inner);
            popupForm.Controls.Add(popupBorder);
        }

        private void SuggestionListBox_DrawItem(object sender, DrawItemEventArgs e)
        {
            if (e.Index < 0 || e.Index >= suggestionListBox.Items.Count) return;

            SuggestionItem item = (SuggestionItem)suggestionListBox.Items[e.Index];
            bool isSelected = (e.State & DrawItemState.Selected) == DrawItemState.Selected;

            Color bg = isSelected ? Color.FromArgb(4, 57, 94) : Color.FromArgb(30, 30, 32);
            using (SolidBrush bgBrush = new SolidBrush(bg))
            {
                e.Graphics.FillRectangle(bgBrush, e.Bounds);
            }

            // Kind Icon Badge
            Color badgeBg = item.Kind == "fn" ? Color.FromArgb(56, 189, 248) :
                            item.Kind == "kw" ? Color.FromArgb(244, 63, 94) :
                            item.Kind == "snip" ? Color.FromArgb(167, 139, 250) : Color.FromArgb(52, 211, 153);

            Rectangle badgeRect = new Rectangle(e.Bounds.X + 4, e.Bounds.Y + 3, 24, 16);
            using (SolidBrush bBrush = new SolidBrush(badgeBg))
            {
                e.Graphics.FillRectangle(bBrush, badgeRect);
            }
            using (Font f = new Font("Segoe UI", 7.5F, FontStyle.Bold))
            {
                e.Graphics.DrawString(item.Kind, f, Brushes.Black, badgeRect.X + 3, badgeRect.Y + 1);
            }

            // Text
            using (Brush textBrush = new SolidBrush(isSelected ? Color.White : Color.FromArgb(220, 220, 225)))
            {
                e.Graphics.DrawString(item.DisplayText, e.Font, textBrush, e.Bounds.X + 34, e.Bounds.Y + 2);
            }
        }

        private void SuggestionListBox_SelectedIndexChanged(object sender, EventArgs e)
        {
            if (suggestionListBox.SelectedItem != null)
            {
                SuggestionItem item = (SuggestionItem)suggestionListBox.SelectedItem;
                suggestionDescLabel.Text = string.IsNullOrEmpty(item.Description) ? item.Text : item.Description;
            }
        }

        private void SuggestionListBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Tab || e.KeyCode == Keys.Enter)
            {
                e.Handled = true;
                e.SuppressKeyPress = true;
                AcceptSelectedSuggestion();
            }
            else if (e.KeyCode == Keys.Escape)
            {
                e.Handled = true;
                popupForm.Hide();
            }
        }

        // Helper for adding menu item with shortcut
        private ToolStripMenuItem AddMenuItem(ToolStripDropDownItem parent, string text, EventHandler onClick, Keys shortcut)
        {
            ToolStripMenuItem item = new ToolStripMenuItem(text, null, onClick);
            if (shortcut != Keys.None)
            {
                item.ShortcutKeys = shortcut;
            }
            parent.DropDownItems.Add(item);
            return item;
        }

        private ToolStripMenuItem AddMenuItem(ToolStripDropDownItem parent, string text, EventHandler onClick)
        {
            return AddMenuItem(parent, text, onClick, Keys.None);
        }

        // --- Menu Bar Builder ---
        private void BuildMenus()
        {
            // File
            ToolStripMenuItem mFile = new ToolStripMenuItem("&File");
            AddMenuItem(mFile, "&New File", (s, e) => CreateNewTab("Untitled-" + (openTabs.Count + 1) + ".plain", "# New Script\n"), Keys.Control | Keys.N);
            AddMenuItem(mFile, "&Open File...", (s, e) => OpenFileDialogPrompt(), Keys.Control | Keys.O);
            AddMenuItem(mFile, "Open &Folder...", (s, e) => OpenFolderDialogPrompt(), Keys.Control | Keys.K);
            mFile.DropDownItems.Add(new ToolStripSeparator());
            AddMenuItem(mFile, "&Save", (s, e) => SaveActiveTab(), Keys.Control | Keys.S);
            AddMenuItem(mFile, "Save &As...", (s, e) => SaveActiveTabAs(), Keys.Control | Keys.Shift | Keys.S);
            AddMenuItem(mFile, "Save A&ll", (s, e) => SaveAllTabs());
            mFile.DropDownItems.Add(new ToolStripSeparator());
            AddMenuItem(mFile, "&Close Tab", (s, e) => CloseTab(activeTab), Keys.Control | Keys.W);
            AddMenuItem(mFile, "E&xit", (s, e) => this.Close(), Keys.Alt | Keys.F4);

            // Edit
            ToolStripMenuItem mEdit = new ToolStripMenuItem("&Edit");
            AddMenuItem(mEdit, "&Undo", (s, e) => { if (activeTab != null) activeTab.Editor.Undo(); }, Keys.Control | Keys.Z);
            AddMenuItem(mEdit, "&Redo", (s, e) => { if (activeTab != null) activeTab.Editor.Redo(); }, Keys.Control | Keys.Y);
            mEdit.DropDownItems.Add(new ToolStripSeparator());
            AddMenuItem(mEdit, "Cu&t", (s, e) => { if (activeTab != null) activeTab.Editor.Cut(); }, Keys.Control | Keys.X);
            AddMenuItem(mEdit, "&Copy", (s, e) => { if (activeTab != null) activeTab.Editor.Copy(); }, Keys.Control | Keys.C);
            AddMenuItem(mEdit, "&Paste", (s, e) => { if (activeTab != null) activeTab.Editor.Paste(); }, Keys.Control | Keys.V);
            AddMenuItem(mEdit, "Select &All", (s, e) => { if (activeTab != null) activeTab.Editor.SelectAll(); }, Keys.Control | Keys.A);
            mEdit.DropDownItems.Add(new ToolStripSeparator());
            AddMenuItem(mEdit, "Trigger &IntelliSense", (s, e) => TriggerIntelliSense(true), Keys.Control | Keys.Space);

            // View
            ToolStripMenuItem mView = new ToolStripMenuItem("&View");
            AddMenuItem(mView, "&Explorer", (s, e) => SwitchSidebarView("explorer"), Keys.Control | Keys.Shift | Keys.E);
            AddMenuItem(mView, "&Cybersecurity Toolbox", (s, e) => SwitchSidebarView("cyber"), Keys.Control | Keys.Shift | Keys.C);
            AddMenuItem(mView, "&AI & Code Snippets", (s, e) => SwitchSidebarView("snippets"), Keys.Control | Keys.Shift | Keys.A);
            mView.DropDownItems.Add(new ToolStripSeparator());
            AddMenuItem(mView, "Toggle &Terminal Panel", (s, e) => { editorSplitter.Panel2Collapsed = !editorSplitter.Panel2Collapsed; }, Keys.Control | Keys.Oemtilde);

            // Run
            ToolStripMenuItem mRun = new ToolStripMenuItem("&Run");
            AddMenuItem(mRun, "&Run Module (Execute File)", (s, e) => RunActiveModule(), Keys.F5);
            AddMenuItem(mRun, "&Stop Execution", (s, e) => StopActiveProcess(), Keys.Control | Keys.Pause);
            AddMenuItem(mRun, "Restart &Shell / Clear Terminal", (s, e) => ClearTerminal());

            // Languages
            ToolStripMenuItem mLang = new ToolStripMenuItem("&Languages");
            string[] langs = new string[] { "PLAIN", "Python", "JavaScript", "TypeScript", "HTML", "CSS", "JSON", "Markdown", "PowerShell", "Plain Text" };
            foreach (string l in langs)
            {
                string langName = l;
                mLang.DropDownItems.Add(langName, null, (s, e) => {
                    if (activeTab != null)
                    {
                        activeTab.Language = langName;
                        statusLanguage.Text = langName;
                    }
                });
            }

            // Cybersecurity Quick Insert
            ToolStripMenuItem mCyber = new ToolStripMenuItem("&Cybersecurity");
            mCyber.DropDownItems.Add("Insert TCP Port Scanner", null, (s, e) => InsertTextAtCursor("import cyber\nports = [21, 22, 80, 443, 8080]\nopen_ports = cyber.port_scan(\"127.0.0.1\", ports)\nsay \"Open Ports: \" + str(open_ports)\n"));
            mCyber.DropDownItems.Add("Insert Security Headers Audit", null, (s, e) => InsertTextAtCursor("import cyber\naudit = cyber.audit_security_headers(\"https://google.com\")\nsay \"Score: \" + str(audit.score) + \"/100 (Grade: \" + audit.grade + \")\"\n"));
            mCyber.DropDownItems.Add("Insert CVE Threat Intel", null, (s, e) => InsertTextAtCursor("import cyber\ncve = cyber.cve_lookup(\"CVE-2021-44228\")\nsay \"Threat: \" + cve.id + \" -> \" + cve.severity\n"));

            // Help
            ToolStripMenuItem mHelp = new ToolStripMenuItem("&Help");
            mHelp.DropDownItems.Add("&About PLAIN Code Studio", null, (s, e) => ShowAboutDialog());
            mHelp.DropDownItems.Add("Language &Documentation (Web)", null, (s, e) => Process.Start("https://reuben123t.github.io/plain-lang/"));

            menuStrip.Items.AddRange(new ToolStripItem[] { mFile, mEdit, mView, mRun, mLang, mCyber, mHelp });
        }

        // --- Activity Bar (VS Code Style Left Strip) ---
        private void BuildActivityBar()
        {
            Button btnExplorer = CreateActivityButton("📁", "Explorer (Ctrl+Shift+E)", (s, e) => SwitchSidebarView("explorer"));
            Button btnCyber = CreateActivityButton("🛡️", "Cybersecurity Tools (Ctrl+Shift+C)", (s, e) => SwitchSidebarView("cyber"));
            Button btnSnippets = CreateActivityButton("🤖", "AI & Snippets (Ctrl+Shift+A)", (s, e) => SwitchSidebarView("snippets"));
            Button btnSettings = CreateActivityButton("⚙️", "Settings", (s, e) => ShowAboutDialog());

            activityBar.Controls.Add(btnSettings);
            btnSettings.Dock = DockStyle.Bottom;

            activityBar.Controls.Add(btnSnippets);
            btnSnippets.Dock = DockStyle.Top;

            activityBar.Controls.Add(btnCyber);
            btnCyber.Dock = DockStyle.Top;

            activityBar.Controls.Add(btnExplorer);
            btnExplorer.Dock = DockStyle.Top;
        }

        private Button CreateActivityButton(string icon, string tooltip, EventHandler onClick)
        {
            Button b = new Button();
            b.Text = icon;
            b.Height = 44;
            b.FlatStyle = FlatStyle.Flat;
            b.FlatAppearance.BorderSize = 0;
            b.BackColor = ColorActivityBg;
            b.ForeColor = Color.White;
            b.Font = new Font("Segoe UI Emoji", 13F);
            b.Cursor = Cursors.Hand;
            b.Click += onClick;

            ToolTip tt = new ToolTip();
            tt.SetToolTip(b, tooltip);
            return b;
        }

        // --- Sidebar Views (Explorer Tree, Cyber Toolbox, Snippets) ---
        private void BuildSidebarViews()
        {
            sidebarHeaderLabel = new Label();
            sidebarHeaderLabel.Dock = DockStyle.Top;
            sidebarHeaderLabel.Height = 32;
            sidebarHeaderLabel.Text = "EXPLORER";
            sidebarHeaderLabel.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            sidebarHeaderLabel.ForeColor = Color.FromArgb(180, 180, 190);
            sidebarHeaderLabel.TextAlign = ContentAlignment.MiddleLeft;
            sidebarHeaderLabel.Padding = new Padding(12, 0, 0, 0);

            // 1. File TreeView
            fileTreeView = new TreeView();
            fileTreeView.Dock = DockStyle.Fill;
            fileTreeView.BackColor = ColorSidebarBg;
            fileTreeView.ForeColor = ColorTextNormal;
            fileTreeView.Font = new Font("Segoe UI", 9F);
            fileTreeView.BorderStyle = BorderStyle.None;
            fileTreeView.NodeMouseDoubleClick += FileTreeView_NodeMouseDoubleClick;

            // 2. Cyber Toolbox ListBox
            cyberToolbox = new ListBox();
            cyberToolbox.Dock = DockStyle.Fill;
            cyberToolbox.BackColor = ColorSidebarBg;
            cyberToolbox.ForeColor = ColorAccentCyan;
            cyberToolbox.Font = new Font("Segoe UI", 9F);
            cyberToolbox.BorderStyle = BorderStyle.None;
            cyberToolbox.Visible = false;
            cyberToolbox.DoubleClick += (s, e) => {
                if (cyberToolbox.SelectedItem != null)
                {
                    InsertTextAtCursor(cyberToolbox.SelectedItem.ToString());
                }
            };

            // 3. Snippets ListBox
            snippetsListBox = new ListBox();
            snippetsListBox.Dock = DockStyle.Fill;
            snippetsListBox.BackColor = ColorSidebarBg;
            snippetsListBox.ForeColor = ColorAccentGreen;
            snippetsListBox.Font = new Font("Segoe UI", 9F);
            snippetsListBox.BorderStyle = BorderStyle.None;
            snippetsListBox.Visible = false;
            snippetsListBox.DoubleClick += (s, e) => {
                if (snippetsListBox.SelectedItem != null)
                {
                    InsertTextAtCursor(snippetsListBox.SelectedItem.ToString());
                }
            };

            sidebarPanel.Controls.Add(fileTreeView);
            sidebarPanel.Controls.Add(cyberToolbox);
            sidebarPanel.Controls.Add(snippetsListBox);
            sidebarPanel.Controls.Add(sidebarHeaderLabel);

            PopulateCyberToolbox();
            PopulateSnippets();
        }

        private void SwitchSidebarView(string view)
        {
            fileTreeView.Visible = (view == "explorer");
            cyberToolbox.Visible = (view == "cyber");
            snippetsListBox.Visible = (view == "snippets");

            if (view == "explorer") sidebarHeaderLabel.Text = "EXPLORER";
            else if (view == "cyber") sidebarHeaderLabel.Text = "CYBERSECURITY TOOLS";
            else if (view == "snippets") sidebarHeaderLabel.Text = "AI & CODE SNIPPETS";
        }

        private void PopulateCyberToolbox()
        {
            cyberToolbox.Items.Add("cyber.port_scan(\"127.0.0.1\", [80, 443])");
            cyberToolbox.Items.Add("cyber.audit_security_headers(\"https://google.com\")");
            cyberToolbox.Items.Add("cyber.cve_lookup(\"CVE-2021-44228\")");
            cyberToolbox.Items.Add("cyber.detect_sql_injection(user_input)");
            cyberToolbox.Items.Add("cyber.detect_xss(user_input)");
            cyberToolbox.Items.Add("cyber.calculate_entropy(file_bytes)");
            cyberToolbox.Items.Add("cyber.subnet_calculator(\"192.168.1.0/24\")");
            cyberToolbox.Items.Add("cyber.check_password_strength(\"P@ssw0rd123\")");
        }

        private void PopulateSnippets()
        {
            snippetsListBox.Items.Add("# Neural Network\nnn = neural_network([2, 4, 1])\ntrain_ai(nn, data, targets, 500)");
            snippetsListBox.Items.Add("# Web Server\nserver = web_server(port: 8080)\nroute(server, \"GET\", \"/\", def(req): return json_response({\"ok\": true}) end)\nstart_server(server)");
            snippetsListBox.Items.Add("# Math & Symbols\nSet ABC = Main\nx = 100\ny = 25\nsay (x + y) * 2 - 50 / 2");
            snippetsListBox.Items.Add("# Python Function\ndef calculate(a, b):\n    return (a + b) ** 2\n");
            snippetsListBox.Items.Add("# JavaScript Fetch\nasync function loadData() {\n    const res = await fetch('/api');\n    return await res.json();\n}");
        }

        private void PopulateFileTree(string rootPath)
        {
            try
            {
                fileTreeView.Nodes.Clear();
                if (!Directory.Exists(rootPath)) return;

                DirectoryInfo rootDir = new DirectoryInfo(rootPath);
                TreeNode rootNode = new TreeNode(rootDir.Name);
                rootNode.Tag = rootDir.FullName;
                fileTreeView.Nodes.Add(rootNode);

                PopulateSubNodes(rootNode, rootDir);
                rootNode.Expand();
            }
            catch { }
        }

        private void PopulateSubNodes(TreeNode parentNode, DirectoryInfo dir)
        {
            try
            {
                foreach (DirectoryInfo subDir in dir.GetDirectories())
                {
                    // Skip hidden / build folders for performance
                    if (subDir.Name.StartsWith(".") || subDir.Name == "node_modules" || subDir.Name == "bin" || subDir.Name == "obj") continue;

                    TreeNode subNode = new TreeNode(subDir.Name);
                    subNode.Tag = subDir.FullName;
                    parentNode.Nodes.Add(subNode);

                    // Shallow 1-level sub expansion
                    try
                    {
                        foreach (FileInfo fi in subDir.GetFiles())
                        {
                            TreeNode fNode = new TreeNode(fi.Name);
                            fNode.Tag = fi.FullName;
                            subNode.Nodes.Add(fNode);
                        }
                    }
                    catch { }
                }

                foreach (FileInfo fi in dir.GetFiles())
                {
                    TreeNode fNode = new TreeNode(fi.Name);
                    fNode.Tag = fi.FullName;
                    parentNode.Nodes.Add(fNode);
                }
            }
            catch { }
        }

        private void FileTreeView_NodeMouseDoubleClick(object sender, TreeNodeMouseClickEventArgs e)
        {
            if (e.Node.Tag != null)
            {
                string path = e.Node.Tag.ToString();
                if (File.Exists(path))
                {
                    // CRITICAL: Open in code-writing editor tab ONLY. NEVER auto-run on open.
                    OpenFileInTab(path);
                }
            }
        }

        // --- Terminal Panel (VS Code Bottom Dock) ---
        private void BuildTerminalPanel(Panel container)
        {
            terminalTabStrip = new Panel();
            terminalTabStrip.Dock = DockStyle.Top;
            terminalTabStrip.Height = 28;
            terminalTabStrip.BackColor = Color.FromArgb(24, 24, 26);

            btnTermTerminal = CreateTerminalTabButton("TERMINAL", true);
            btnTermOutput   = CreateTerminalTabButton("OUTPUT", false);
            btnTermShell    = CreateTerminalTabButton("PLAIN INTERACTIVE SHELL", false);

            terminalTabStrip.Controls.Add(btnTermShell);
            btnTermShell.Dock = DockStyle.Left;

            terminalTabStrip.Controls.Add(btnTermOutput);
            btnTermOutput.Dock = DockStyle.Left;

            terminalTabStrip.Controls.Add(btnTermTerminal);
            btnTermTerminal.Dock = DockStyle.Left;

            // Interactive Input Row at bottom of terminal
            interactiveInputPanel = new Panel();
            interactiveInputPanel.Dock = DockStyle.Bottom;
            interactiveInputPanel.Height = 30;
            interactiveInputPanel.BackColor = Color.FromArgb(24, 24, 26);
            interactiveInputPanel.Padding = new Padding(4);

            Label pLabel = new Label();
            pLabel.Text = ">>>";
            pLabel.Dock = DockStyle.Left;
            pLabel.Width = 36;
            pLabel.Font = new Font("Consolas", 10F, FontStyle.Bold);
            pLabel.ForeColor = ColorAccentCyan;
            pLabel.TextAlign = ContentAlignment.MiddleCenter;

            interactiveExecuteBtn = new Button();
            interactiveExecuteBtn.Text = "Run";
            interactiveExecuteBtn.Dock = DockStyle.Right;
            interactiveExecuteBtn.Width = 60;
            interactiveExecuteBtn.FlatStyle = FlatStyle.Flat;
            interactiveExecuteBtn.FlatAppearance.BorderColor = ColorBorder;
            interactiveExecuteBtn.BackColor = Color.FromArgb(37, 37, 38);
            interactiveExecuteBtn.ForeColor = ColorAccentGreen;
            interactiveExecuteBtn.Font = new Font("Segoe UI", 8.5F);
            interactiveExecuteBtn.Click += (s, e) => ExecuteInteractiveCommand();

            interactiveInputBox = new TextBox();
            interactiveInputBox.Dock = DockStyle.Fill;
            interactiveInputBox.BackColor = Color.FromArgb(30, 30, 32);
            interactiveInputBox.ForeColor = ColorTextNormal;
            interactiveInputBox.Font = new Font("Consolas", 9.5F);
            interactiveInputBox.BorderStyle = BorderStyle.FixedSingle;
            interactiveInputBox.KeyDown += (s, e) => {
                if (e.KeyCode == Keys.Enter)
                {
                    e.SuppressKeyPress = true;
                    ExecuteInteractiveCommand();
                }
            };

            interactiveInputPanel.Controls.Add(interactiveInputBox);
            interactiveInputPanel.Controls.Add(pLabel);
            interactiveInputPanel.Controls.Add(interactiveExecuteBtn);

            terminalTextBox = new RichTextBox();
            terminalTextBox.Dock = DockStyle.Fill;
            terminalTextBox.BackColor = ColorTerminalBg;
            terminalTextBox.ForeColor = ColorAccentGreen;
            terminalTextBox.Font = new Font("Consolas", 10F);
            terminalTextBox.BorderStyle = BorderStyle.None;
            terminalTextBox.ReadOnly = true;
            terminalTextBox.ScrollBars = RichTextBoxScrollBars.Vertical;

            container.Controls.Add(terminalTextBox);
            container.Controls.Add(interactiveInputPanel);
            container.Controls.Add(terminalTabStrip);
        }

        private Button CreateTerminalTabButton(string text, bool isActive)
        {
            Button b = new Button();
            b.Text = text;
            b.FlatStyle = FlatStyle.Flat;
            b.FlatAppearance.BorderSize = 0;
            b.BackColor = isActive ? ColorTerminalBg : Color.FromArgb(24, 24, 26);
            b.ForeColor = isActive ? Color.White : Color.FromArgb(150, 150, 160);
            b.Font = new Font("Segoe UI", 8.5F, isActive ? FontStyle.Bold : FontStyle.Regular);
            b.AutoSize = true;
            b.Padding = new Padding(10, 0, 10, 0);
            b.Cursor = Cursors.Hand;
            b.Click += (s, e) => {
                btnTermTerminal.BackColor = Color.FromArgb(24, 24, 26);
                btnTermOutput.BackColor = Color.FromArgb(24, 24, 26);
                btnTermShell.BackColor = Color.FromArgb(24, 24, 26);
                b.BackColor = ColorTerminalBg;
            };
            return b;
        }

        private void PrintTerminalBanner()
        {
            terminalTextBox.Clear();
            AppendTerminalText("PLAIN Code Studio Terminal [v1.3.0]\n", ColorAccentCyan, true);
            AppendTerminalText("Press F5 to Run Module • Multi-language execution (PLAIN, Python, JS, HTML)\n", Color.FromArgb(160, 160, 170), false);
            AppendTerminalText(new string('─', 72) + "\n\n", ColorBorder, false);
        }

        private void AppendTerminalText(string text, Color color, bool bold)
        {
            if (terminalTextBox.InvokeRequired)
            {
                terminalTextBox.Invoke(new Action<string, Color, bool>(AppendTerminalText), text, color, bold);
                return;
            }

            terminalTextBox.SelectionStart = terminalTextBox.TextLength;
            terminalTextBox.SelectionLength = 0;
            terminalTextBox.SelectionColor = color;
            terminalTextBox.SelectionFont = new Font(terminalTextBox.Font, bold ? FontStyle.Bold : FontStyle.Regular);
            terminalTextBox.AppendText(text);
            terminalTextBox.SelectionColor = terminalTextBox.ForeColor;
            terminalTextBox.ScrollToCaret();
        }

        // --- Tab & Document Management ---
        private EditorTab CreateNewTab(string title, string content, string filePath = null)
        {
            EditorTab tab = new EditorTab();
            tab.Title = title;
            tab.FilePath = filePath;
            tab.IsModified = false;
            tab.Language = DetectLanguageFromPath(filePath != null ? filePath : title);

            // RichTextBox Code Editor
            RichTextBox rtb = new RichTextBox();
            rtb.Dock = DockStyle.Fill;
            rtb.BackColor = ColorEditorBg;
            rtb.ForeColor = ColorTextNormal;
            rtb.Font = new Font("Consolas", 11.5F);
            rtb.BorderStyle = BorderStyle.None;
            rtb.AcceptsTab = true;
            rtb.WordWrap = false;
            rtb.ScrollBars = RichTextBoxScrollBars.Both;
            rtb.Text = content; // editorTextBox.Text = content;

            rtb.TextChanged += (s, e) => {
                if (!tab.IsModified && !isUpdatingText)
                {
                    tab.IsModified = true;
                    UpdateTabHeader(tab);
                }
                lineGutter.Invalidate();
                TriggerIntelliSense(false);
            };

            rtb.SelectionChanged += (s, e) => UpdateCursorStatus(rtb);
            rtb.VScroll += (s, e) => lineGutter.Invalidate();
            rtb.KeyDown += Editor_KeyDown;

            tab.Editor = rtb;

            // Tab Button in Tab Strip
            Button tabBtn = new Button();
            tabBtn.Text = title + "  ×";
            tabBtn.AutoSize = true;
            tabBtn.Height = 32;
            tabBtn.FlatStyle = FlatStyle.Flat;
            tabBtn.FlatAppearance.BorderSize = 0;
            tabBtn.BackColor = ColorTabInactBg;
            tabBtn.ForeColor = Color.FromArgb(180, 180, 190);
            tabBtn.Font = new Font("Segoe UI", 9F);
            tabBtn.Padding = new Padding(12, 0, 8, 0);
            tabBtn.Cursor = Cursors.Hand;

            tabBtn.Click += (s, e) => {
                // If clicked near the close '×'
                Point p = tabBtn.PointToClient(Cursor.Position);
                if (p.X >= tabBtn.Width - 22)
                {
                    CloseTab(tab);
                }
                else
                {
                    ActivateTab(tab);
                }
            };

            tab.TabButton = tabBtn;

            openTabs.Add(tab);
            tabStripPanel.Controls.Add(tabBtn);

            ActivateTab(tab);
            return tab;
        }

        private void ActivateTab(EditorTab tab)
        {
            if (tab == null) return;
            activeTab = tab;

            editorHostPanel.Controls.Clear();
            editorHostPanel.Controls.Add(tab.Editor);
            editorHostPanel.Controls.Add(lineGutter); // Add gutter to left

            foreach (EditorTab t in openTabs)
            {
                if (t == tab)
                {
                    t.TabButton.BackColor = ColorTabActiveBg;
                    t.TabButton.ForeColor = Color.White;
                }
                else
                {
                    t.TabButton.BackColor = ColorTabInactBg;
                    t.TabButton.ForeColor = Color.FromArgb(160, 160, 170);
                }
            }

            statusLanguage.Text = tab.Language;
            UpdateCursorStatus(tab.Editor);
            UpdateWindowTitle();
            lineGutter.Invalidate();
            tab.Editor.Focus();
        }

        private void UpdateTabHeader(EditorTab tab)
        {
            string mod = tab.IsModified ? "● " : "";
            tab.TabButton.Text = mod + tab.Title + "  ×";
            UpdateWindowTitle();
        }

        private void CloseTab(EditorTab tab)
        {
            if (tab == null) return;

            if (tab.IsModified)
            {
                DialogResult dr = MessageBox.Show(string.Format("Save changes to {0} before closing?", tab.Title), "Save Changes", MessageBoxButtons.YesNoCancel, MessageBoxIcon.Question);
                if (dr == DialogResult.Yes)
                {
                    SaveTab(tab);
                }
                else if (dr == DialogResult.Cancel)
                {
                    return;
                }
            }

            tabStripPanel.Controls.Remove(tab.TabButton);
            openTabs.Remove(tab);

            if (openTabs.Count > 0)
            {
                ActivateTab(openTabs[openTabs.Count - 1]);
            }
            else
            {
                CreateNewTab("Untitled-1.plain", "");
            }
        }

        public void OpenFileInTab(string filePath)
        {
            try
            {
                string fullPath = Path.GetFullPath(filePath);

                // If already open, switch to it
                foreach (EditorTab t in openTabs)
                {
                    if (t.FilePath != null && string.Equals(t.FilePath, fullPath, StringComparison.OrdinalIgnoreCase))
                    {
                        ActivateTab(t);
                        return;
                    }
                }

                // Read clean UTF-8 without BOM
                string content = File.ReadAllText(fullPath, Utf8NoBom);
                if (content.Length > 0 && content[0] == '\uFEFF')
                {
                    content = content.Substring(1);
                }

                string fileName = Path.GetFileName(fullPath);

                // CRITICAL REQUIREMENT: Load into code-writing editor area ONLY. DO NOT RUN.
                EditorTab tab = CreateNewTab(fileName, content, fullPath);
                tab.IsModified = false;
                UpdateTabHeader(tab);

                AppendTerminalText(string.Format("[Opened: {0} in code editor]\n", fileName), Color.FromArgb(140, 140, 150), false);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to open file: " + ex.Message, "Open Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        public void OpenFile(string filePath)
        {
            OpenFileInTab(filePath);
        }

        private bool SaveTab(EditorTab tab)
        {
            if (tab == null) return false;

            if (string.IsNullOrEmpty(tab.FilePath))
            {
                using (SaveFileDialog sfd = new SaveFileDialog())
                {
                    sfd.Filter = "PLAIN Files (*.plain)|*.plain|Python Files (*.py)|*.py|JavaScript Files (*.js)|*.js|HTML Files (*.html)|*.html|All Files (*.*)|*.*";
                    sfd.Title = "Save File As";
                    if (sfd.ShowDialog() == DialogResult.OK)
                    {
                        tab.FilePath = Path.GetFullPath(sfd.FileName);
                        tab.Title = Path.GetFileName(tab.FilePath);
                        tab.Language = DetectLanguageFromPath(tab.FilePath);
                    }
                    else
                    {
                        return false;
                    }
                }
            }

            try
            {
                // Write clean UTF-8 without BOM
                File.WriteAllText(tab.FilePath, tab.Editor.Text, Utf8NoBom);
                tab.IsModified = false;
                UpdateTabHeader(tab);
                return true;
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to save: " + ex.Message, "Save Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return false;
            }
        }

        private void SaveActiveTab() { SaveTab(activeTab); }
        private void SaveActiveTabAs() { if (activeTab != null) { activeTab.FilePath = null; SaveTab(activeTab); } }
        private void SaveAllTabs() { foreach (EditorTab t in openTabs) SaveTab(t); }

        private string DetectLanguageFromPath(string path)
        {
            if (string.IsNullOrEmpty(path)) return "PLAIN";
            string ext = Path.GetExtension(path).ToLowerInvariant();

            switch (ext)
            {
                case ".plain": return "PLAIN";
                case ".py": return "Python";
                case ".js": return "JavaScript";
                case ".ts": return "TypeScript";
                case ".html":
                case ".htm": return "HTML";
                case ".css": return "CSS";
                case ".json": return "JSON";
                case ".md": return "Markdown";
                case ".cs": return "C#";
                case ".ps1": return "PowerShell";
                case ".bat":
                case ".cmd": return "Batch";
                default: return "Plain Text";
            }
        }

        private void UpdateWindowTitle()
        {
            string docName = activeTab != null ? activeTab.Title : "Untitled";
            string mod = (activeTab != null && activeTab.IsModified) ? "● " : "";
            this.Text = string.Format("{0}{1} - PLAIN Code Studio", mod, docName);
        }

        private void UpdateCursorStatus(RichTextBox rtb)
        {
            int index = rtb.SelectionStart;
            int line = rtb.GetLineFromCharIndex(index) + 1;
            int col = index - rtb.GetFirstCharIndexOfCurrentLine() + 1;
            statusCursorPos.Text = string.Format("Ln {0}, Col {1}", line, col);
        }

        // --- Line Number Gutter Paint ---
        private void LineGutter_Paint(object sender, PaintEventArgs e)
        {
            if (activeTab == null || activeTab.Editor == null) return;

            RichTextBox rtb = activeTab.Editor;
            e.Graphics.Clear(ColorGutterBg);

            int firstIndex = rtb.GetCharIndexFromPosition(new Point(0, 0));
            int firstLine = rtb.GetLineFromCharIndex(firstIndex);
            int lastIndex = rtb.GetCharIndexFromPosition(new Point(0, rtb.Height));
            int lastLine = rtb.GetLineFromCharIndex(lastIndex);

            int caretLine = rtb.GetLineFromCharIndex(rtb.SelectionStart);

            using (Font f = new Font("Consolas", 10F))
            using (StringFormat sf = new StringFormat() { Alignment = StringAlignment.Far })
            {
                for (int i = firstLine; i <= lastLine; i++)
                {
                    Point p = rtb.GetPositionFromCharIndex(rtb.GetFirstCharIndexFromLine(i));
                    bool isCurrent = (i == caretLine);

                    Brush b = isCurrent ? Brushes.White : new SolidBrush(ColorGutterText);
                    e.Graphics.DrawString((i + 1).ToString(), f, b, new RectangleF(0, p.Y, lineGutter.Width - 6, 20), sf);
                    if (!isCurrent) b.Dispose();
                }
            }
        }

        // --- Autocomplete / IntelliSense Engine ---
        private void TriggerIntelliSense(bool explicitTrigger)
        {
            if (activeTab == null || isUpdatingText) return;

            RichTextBox rtb = activeTab.Editor;
            int caretPos = rtb.SelectionStart;
            string text = rtb.Text;

            // Extract the word prefix currently being typed
            int start = caretPos - 1;
            while (start >= 0 && (char.IsLetterOrDigit(text[start]) || text[start] == '_' || text[start] == '.'))
            {
                start--;
            }
            start++;

            if (start > caretPos) return;
            string prefix = text.Substring(start, caretPos - start);

            if (string.IsNullOrEmpty(prefix) && !explicitTrigger)
            {
                popupForm.Hide();
                return;
            }

            currentPrefix = prefix;
            prefixStartPos = start;

            // Filter completions
            List<SuggestionItem> matches = new List<SuggestionItem>();
            string lowerPrefix = prefix.ToLowerInvariant();

            foreach (SuggestionItem item in masterDict)
            {
                if (item.Text.ToLowerInvariant().Contains(lowerPrefix))
                {
                    matches.Add(item);
                }
            }

            // Also dynamically scan active document for local identifiers
            string[] docWords = text.Split(new char[] { ' ', '\t', '\n', '\r', '(', ')', '[', ']', '{', '}', '=', '+', '-', '*', '/', ',', ':', ';', '"', '\'' }, StringSplitOptions.RemoveEmptyEntries);
            HashSet<string> seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (string w in docWords)
            {
                if (w.Length > 2 && w.ToLowerInvariant().StartsWith(lowerPrefix) && !seen.Contains(w))
                {
                    seen.Add(w);
                    if (!masterDict.Exists(m => string.Equals(m.Text, w, StringComparison.OrdinalIgnoreCase)))
                    {
                        matches.Insert(0, new SuggestionItem(w, "var", "Local identifier"));
                    }
                }
            }

            if (matches.Count == 0)
            {
                popupForm.Hide();
                return;
            }

            // Populate Suggestion List
            suggestionListBox.BeginUpdate();
            suggestionListBox.Items.Clear();
            foreach (SuggestionItem m in matches.GetRange(0, Math.Min(30, matches.Count)))
            {
                suggestionListBox.Items.Add(m);
            }
            suggestionListBox.SelectedIndex = 0;
            suggestionListBox.EndUpdate();

            // Position Popup directly below cursor caret
            Point caretCoord = rtb.GetPositionFromCharIndex(caretPos);
            Point screenPos = rtb.PointToScreen(caretCoord);
            screenPos.Y += (int)(rtb.Font.Height * 1.3);

            // Screen boundary clamping
            Screen sc = Screen.FromPoint(screenPos);
            if (screenPos.Y + popupForm.Height > sc.WorkingArea.Bottom)
            {
                screenPos.Y -= popupForm.Height + (int)(rtb.Font.Height * 1.5);
            }
            if (screenPos.X + popupForm.Width > sc.WorkingArea.Right)
            {
                screenPos.X = sc.WorkingArea.Right - popupForm.Width - 10;
            }

            popupForm.Location = screenPos;
            if (!popupForm.Visible)
            {
                popupForm.Show();
            }
        }

        private void AcceptSelectedSuggestion()
        {
            if (activeTab == null || suggestionListBox.SelectedItem == null) return;

            SuggestionItem item = (SuggestionItem)suggestionListBox.SelectedItem;
            RichTextBox rtb = activeTab.Editor;

            isUpdatingText = true;
            try
            {
                int caret = rtb.SelectionStart;
                int replaceLen = caret - prefixStartPos;

                rtb.Select(prefixStartPos, replaceLen);
                rtb.SelectedText = item.Text;
                rtb.SelectionStart = prefixStartPos + item.Text.Length;
                rtb.SelectionLength = 0;
            }
            finally
            {
                isUpdatingText = false;
            }

            popupForm.Hide();
            rtb.Focus();
        }

        private void Editor_KeyDown(object sender, KeyEventArgs e)
        {
            if (popupForm.Visible)
            {
                if (e.KeyCode == Keys.Down)
                {
                    e.Handled = true;
                    if (suggestionListBox.SelectedIndex < suggestionListBox.Items.Count - 1)
                        suggestionListBox.SelectedIndex++;
                    return;
                }
                if (e.KeyCode == Keys.Up)
                {
                    e.Handled = true;
                    if (suggestionListBox.SelectedIndex > 0)
                        suggestionListBox.SelectedIndex--;
                    return;
                }
                if (e.KeyCode == Keys.Tab || e.KeyCode == Keys.Enter)
                {
                    e.Handled = true;
                    e.SuppressKeyPress = true;
                    AcceptSelectedSuggestion();
                    return;
                }
                if (e.KeyCode == Keys.Escape)
                {
                    e.Handled = true;
                    popupForm.Hide();
                    return;
                }
            }

            if (e.KeyCode == Keys.F5)
            {
                e.Handled = true;
                RunActiveModule();
            }
        }

        private void PlainIdeForm_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.F5)
            {
                e.Handled = true;
                RunActiveModule();
            }
        }

        private void PlainIdeForm_DragDrop(object sender, DragEventArgs e)
        {
            string[] files = (string[])e.Data.GetData(DataFormats.FileDrop);
            if (files != null && files.Length > 0 && File.Exists(files[0]))
            {
                OpenFileInTab(files[0]);
            }
        }

        // --- Execution Runner (Multi-Language: PLAIN, Python, Node/JS, HTML, PowerShell) ---
        public void RunModule()
        {
            RunActiveModule();
        }

        private void RunActiveModule()
        {
            if (activeTab == null) return;

            if (string.IsNullOrEmpty(activeTab.FilePath) || activeTab.IsModified)
            {
                if (!SaveTab(activeTab)) return;
            }

            StopActiveProcess();

            string filePath = activeTab.FilePath;
            string fileName = Path.GetFileName(filePath);
            string lang = activeTab.Language;

            AppendTerminalText(string.Format("\n▶ [RUN MODULE]: {0} ({1})\n", filePath, lang), ColorAccentCyan, true);
            statusRunState.Text = "Running...";

            string execPath;
            string execArgs;

            switch (lang)
            {
                case "Python":
                    execPath = "python";
                    execArgs = string.Format("\"{0}\"", filePath);
                    break;
                case "JavaScript":
                    execPath = "node";
                    execArgs = string.Format("\"{0}\"", filePath);
                    break;
                case "TypeScript":
                    execPath = "npx";
                    execArgs = string.Format("tsx \"{0}\"", filePath);
                    break;
                case "HTML":
                    Process.Start(new ProcessStartInfo(filePath) { UseShellExecute = true });
                    AppendTerminalText("[Launched in default Web Browser]\n", ColorAccentGreen, false);
                    statusRunState.Text = "F5: Run Module";
                    return;
                case "PowerShell":
                    execPath = "powershell";
                    execArgs = string.Format("-ExecutionPolicy Bypass -File \"{0}\"", filePath);
                    break;
                case "PLAIN":
                default:
                    execPath = LocatePlainExecutable();
                    execArgs = string.Format("\"{0}\"", filePath);
                    break;
            }

            ExecuteProcessAsync(execPath, execArgs, Path.GetDirectoryName(filePath));
        }

        private void ExecuteProcessAsync(string fileName, string arguments, string workingDir)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = fileName;
                psi.Arguments = arguments;
                psi.WorkingDirectory = string.IsNullOrEmpty(workingDir) ? Environment.CurrentDirectory : workingDir;
                psi.UseShellExecute = false;
                psi.RedirectStandardOutput = true;
                psi.RedirectStandardError = true;
                psi.CreateNoWindow = true;

                activeProcess = new Process();
                activeProcess.StartInfo = psi;
                activeProcess.EnableRaisingEvents = true;

                activeProcess.OutputDataReceived += (s, e) => {
                    if (e.Data != null) AppendTerminalText(e.Data + "\n", ColorTextNormal, false);
                };

                activeProcess.ErrorDataReceived += (s, e) => {
                    if (e.Data != null) AppendTerminalText(e.Data + "\n", Color.FromArgb(248, 113, 113), false);
                };

                activeProcess.Exited += (s, e) => {
                    int code = activeProcess != null ? activeProcess.ExitCode : 0;
                    AppendTerminalText(string.Format("\n[Process exited with code {0}]\n>>> ", code), code == 0 ? ColorAccentGreen : Color.FromArgb(248, 113, 113), true);
                    statusRunState.Text = "F5: Run Module";
                    activeProcess = null;
                };

                activeProcess.Start();
                activeProcess.BeginOutputReadLine();
                activeProcess.BeginErrorReadLine();
            }
            catch (Exception ex)
            {
                AppendTerminalText(string.Format("Execution failed: {0}\n>>> ", ex.Message), Color.FromArgb(248, 113, 113), false);
                statusRunState.Text = "F5: Run Module";
            }
        }

        private void ExecuteInteractiveCommand()
        {
            string cmd = interactiveInputBox.Text.Trim();
            if (string.IsNullOrEmpty(cmd)) return;

            interactiveInputBox.Clear();
            AppendTerminalText(string.Format("\n>>> {0}\n", cmd), ColorAccentCyan, true);

            string plainExec = LocatePlainExecutable();
            string escaped = cmd.Replace("\"", "\\\"");
            ExecuteProcessAsync(plainExec, string.Format("-e \"{0}\"", escaped), Environment.CurrentDirectory);
        }

        private string LocatePlainExecutable()
        {
            string localPlainCmd = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "PLAIN", "bin", "plain.cmd");
            if (File.Exists(localPlainCmd)) return localPlainCmd;

            string localPlainExe = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "PLAIN", "bin", "plain.exe");
            if (File.Exists(localPlainExe)) return localPlainExe;

            return "plain.cmd";
        }

        private void StopActiveProcess()
        {
            if (activeProcess != null && !activeProcess.HasExited)
            {
                try
                {
                    activeProcess.Kill();
                    AppendTerminalText("\n[Process terminated by user]\n>>> ", Color.FromArgb(248, 113, 113), true);
                }
                catch { }
                activeProcess = null;
                statusRunState.Text = "F5: Run Module";
            }
        }

        private void ClearTerminal()
        {
            PrintTerminalBanner();
        }

        private void InsertTextAtCursor(string text)
        {
            if (activeTab != null && activeTab.Editor != null)
            {
                activeTab.Editor.SelectedText = text;
                activeTab.Editor.Focus();
            }
        }

        // --- Dialogs ---
        private void OpenFileDialogPrompt()
        {
            using (OpenFileDialog ofd = new OpenFileDialog())
            {
                ofd.Filter = "All Supported Files (*.plain;*.py;*.js;*.ts;*.html;*.css;*.json;*.md;*.txt)|*.plain;*.py;*.js;*.ts;*.html;*.css;*.json;*.md;*.txt|PLAIN (*.plain)|*.plain|Python (*.py)|*.py|Web (*.js;*.ts;*.html;*.css)|*.js;*.ts;*.html;*.css|All Files (*.*)|*.*";
                ofd.Title = "Open Source File (Loads into Editor Only)";
                if (ofd.ShowDialog() == DialogResult.OK)
                {
                    OpenFileInTab(ofd.FileName);
                }
            }
        }

        private void OpenFolderDialogPrompt()
        {
            using (FolderBrowserDialog fbd = new FolderBrowserDialog())
            {
                fbd.Description = "Select Workspace Folder to Open in Explorer";
                if (fbd.ShowDialog() == DialogResult.OK)
                {
                    currentWorkspaceDir = fbd.SelectedPath;
                    PopulateFileTree(currentWorkspaceDir);
                }
            }
        }

        private void ShowAboutDialog()
        {
            string msg = "PLAIN Code Studio — Version 1.3.0\n\n" +
                         "A high-performance, VS Code-inspired desktop development environment.\n\n" +
                         "Key Capabilities:\n" +
                         " • Multi-Tab Code Editor with Real-Time Line Numbers\n" +
                         " • VS Code-Style IntelliSense Autocomplete Engine\n" +
                         " • Multi-Language Support (PLAIN, Python, JavaScript, HTML, CSS, JSON, Markdown)\n" +
                         " • Integrated Terminal & Interactive Shell Dock\n" +
                         " • Workspace File Explorer Tree & Quick Cyber / AI Snippets\n" +
                         " • Native Non-BOM UTF-8 Persistence\n" +
                         " • Execution via F5 or Run Menu\n\n" +
                         "Documentation: https://reuben123t.github.io/plain-lang/";

            MessageBox.Show(msg, "About PLAIN Code Studio", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }

    // Custom Color Table for VS Code Dark Menu Styling
    public class VsCodeColorTable : ProfessionalColorTable
    {
        public override Color MenuBorder { get { return Color.FromArgb(50, 50, 55); } }
        public override Color MenuItemBorder { get { return Color.FromArgb(0, 122, 204); } }
        public override Color MenuItemSelected { get { return Color.FromArgb(4, 57, 94); } }
        public override Color ToolStripDropDownBackground { get { return Color.FromArgb(30, 30, 32); } }
        public override Color ImageMarginGradientBegin { get { return Color.FromArgb(30, 30, 32); } }
        public override Color ImageMarginGradientMiddle { get { return Color.FromArgb(30, 30, 32); } }
        public override Color ImageMarginGradientEnd { get { return Color.FromArgb(30, 30, 32); } }
    }
}
