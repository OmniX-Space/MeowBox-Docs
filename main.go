/*
 * The simplest web service
 * Created by MoeCinnamo on 2025/11/26.
 *
 * This is a simple web service that serves static files from the "docs" directory.
 */

package main

import (
	"embed"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"text/template"
)

func main() {
	stop()
	start()
}

//go:embed docs
var webFiles embed.FS

//go:embed docs/index.html
var indexTemplateContent string

//go:embed docs/404.html
var notFoundTemplateContent string

var (
	indexTemplate    *template.Template
	notFoundTemplate *template.Template
	indexOnce        sync.Once
	notFoundOnce     sync.Once
)

func start() {
	log.Printf("[Info] Starting MeowBox Docs...\r\n")
	log.Printf("[Info] Web service started on 0.0.0.0:2230")
	route()
	err := http.ListenAndServe("0.0.0.0:2230", nil)
	if err != nil {
		log.Fatalf("[Error] Failed to start server: %v", err)
	}
}

func stop() {
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigCh
		log.Printf("[Info] Received signal: %v，stopping...\r\n", sig)
		os.Exit(0)
	}()
}

// StaticFileHandler Embedded static file service
func staticFileHandler(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path

	// Clean path, make sure it starts with "docs/"
	path = strings.TrimPrefix(path, "/")
	if path == "" {
		notFoundHandler(w, r)
		return
	}

	// Concatenate embed.FS path
	filePath := "docs/" + path
	data, err := webFiles.ReadFile(filePath)
	if err != nil {
		log.Printf("[Error] Static file not found: %s", filePath)
		notFoundHandler(w, r)
		return
	}

	// Set Content-Type
	contentType := getContentType(path)
	w.Header().Set("Content-Type", contentType)

	_, _ = w.Write(data)
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		notFoundHandler(w, r)
		return
	}
	loadIndexTemplate()
	log.Printf("[Info] [Web Access] Handler index page, on path: %s", r.URL.Path)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := indexTemplate.Execute(w, nil); err != nil {
		log.Printf("[Error] Failed to render index page: %v", err)
	}
}

func notFoundHandler(w http.ResponseWriter, r *http.Request) {
	loadNotFoundTemplate()
	log.Printf("[Info] [Web Access] Handler http error page: 404, on path: %s", r.URL.Path)
	w.WriteHeader(404)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := notFoundTemplate.Execute(w, nil); err != nil {
		log.Printf("[Error] Failed to render index page: %v", err)
	}
}

func loadIndexTemplate() {
	indexOnce.Do(func() {
		var err error
		indexTemplate, err = template.New("index").Parse(indexTemplateContent)
		if err != nil {
			log.Fatalf("[Error] Failed to parse index template: %v", err)
		}
	})
}

func loadNotFoundTemplate() {
	notFoundOnce.Do(func() {
		var err error
		notFoundTemplate, err = template.New("error").Parse(notFoundTemplateContent)
		if err != nil {
			log.Fatalf("[Error] Failed to parse 404 template: %v", err)
		}
	})
}

func route() {
	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/.well-known/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})
	http.HandleFunc("/favicon.ico", staticFileHandler)
	http.HandleFunc("/css/", staticFileHandler)
	http.HandleFunc("/font-awesome/", staticFileHandler)
	http.HandleFunc("/js/", staticFileHandler)
	http.HandleFunc("/img/", staticFileHandler)
	http.HandleFunc("/markdown/", staticFileHandler)
}

func getContentType(filename string) string {
	// Convert file names to lowercase for case insensitive comparison
	lowerFilename := strings.ToLower(filename)

	switch {
	// Text files
	case strings.HasSuffix(lowerFilename, ".css"):
		return "text/css; charset=utf-8"
	case strings.HasSuffix(lowerFilename, ".js"):
		return "application/javascript; charset=utf-8"
	case strings.HasSuffix(lowerFilename, ".json"):
		return "application/json; charset=utf-8"
	case strings.HasSuffix(lowerFilename, ".xml"):
		return "application/xml; charset=utf-8"
	case strings.HasSuffix(lowerFilename, ".html"), strings.HasSuffix(lowerFilename, ".htm"):
		return "text/html; charset=utf-8"
	case strings.HasSuffix(lowerFilename, ".txt"):
		return "text/plain; charset=utf-8"
	case strings.HasSuffix(lowerFilename, ".md"):
		return "text/markdown; charset=utf-8"
	case strings.HasSuffix(lowerFilename, ".csv"):
		return "text/csv; charset=utf-8"

	// Image files
	case strings.HasSuffix(lowerFilename, ".webp"):
		return "image/webp"
	case strings.HasSuffix(lowerFilename, ".png"):
		return "image/png"
	case strings.HasSuffix(lowerFilename, ".jpg"), strings.HasSuffix(lowerFilename, ".jpeg"):
		return "image/jpeg"
	case strings.HasSuffix(lowerFilename, ".gif"):
		return "image/gif"
	case strings.HasSuffix(lowerFilename, ".bmp"):
		return "image/bmp"
	case strings.HasSuffix(lowerFilename, ".ico"):
		return "image/x-icon"
	case strings.HasSuffix(lowerFilename, ".svg"), strings.HasSuffix(lowerFilename, ".svgz"):
		return "image/svg+xml"
	case strings.HasSuffix(lowerFilename, ".tiff"), strings.HasSuffix(lowerFilename, ".tif"):
		return "image/tiff"
	case strings.HasSuffix(lowerFilename, ".avif"):
		return "image/avif"

	// Audio files
	case strings.HasSuffix(lowerFilename, ".mp3"):
		return "audio/mpeg"
	case strings.HasSuffix(lowerFilename, ".wav"):
		return "audio/wav"
	case strings.HasSuffix(lowerFilename, ".ogg"):
		return "audio/ogg"
	case strings.HasSuffix(lowerFilename, ".flac"):
		return "audio/flac"
	case strings.HasSuffix(lowerFilename, ".aac"):
		return "audio/aac"
	case strings.HasSuffix(lowerFilename, ".m4a"):
		return "audio/mp4"

	// Video files
	case strings.HasSuffix(lowerFilename, ".mp4"):
		return "video/mp4"
	case strings.HasSuffix(lowerFilename, ".webm"):
		return "video/webm"
	case strings.HasSuffix(lowerFilename, ".ogg"), strings.HasSuffix(lowerFilename, ".ogv"):
		return "video/ogg"
	case strings.HasSuffix(lowerFilename, ".mov"):
		return "video/quicktime"
	case strings.HasSuffix(lowerFilename, ".avi"):
		return "video/x-msvideo"
	case strings.HasSuffix(lowerFilename, ".wmv"):
		return "video/x-ms-wmv"
	case strings.HasSuffix(lowerFilename, ".flv"):
		return "video/x-flv"
	case strings.HasSuffix(lowerFilename, ".mkv"):
		return "video/x-matroska"

	// Font files
	case strings.HasSuffix(lowerFilename, ".woff"):
		return "font/woff"
	case strings.HasSuffix(lowerFilename, ".woff2"):
		return "font/woff2"
	case strings.HasSuffix(lowerFilename, ".ttf"):
		return "font/ttf"
	case strings.HasSuffix(lowerFilename, ".otf"):
		return "font/otf"

	// Archive files
	case strings.HasSuffix(lowerFilename, ".zip"):
		return "application/zip"
	case strings.HasSuffix(lowerFilename, ".rar"):
		return "application/x-rar-compressed"
	case strings.HasSuffix(lowerFilename, ".gz"):
		return "application/gzip"
	case strings.HasSuffix(lowerFilename, ".tar"):
		return "application/x-tar"
	case strings.HasSuffix(lowerFilename, ".7z"):
		return "application/x-7z-compressed"
	case strings.HasSuffix(lowerFilename, ".bz2"):
		return "application/x-bzip2"
	case strings.HasSuffix(lowerFilename, ".xz"):
		return "application/x-xz"

	// Document files
	case strings.HasSuffix(lowerFilename, ".pdf"):
		return "application/pdf"
	case strings.HasSuffix(lowerFilename, ".doc"):
		return "application/msword"
	case strings.HasSuffix(lowerFilename, ".docx"):
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case strings.HasSuffix(lowerFilename, ".xls"):
		return "application/vnd.ms-excel"
	case strings.HasSuffix(lowerFilename, ".xlsx"):
		return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	case strings.HasSuffix(lowerFilename, ".ppt"):
		return "application/vnd.ms-powerpoint"
	case strings.HasSuffix(lowerFilename, ".pptx"):
		return "application/vnd.openxmlformats-officedocument.presentationml.presentation"
	case strings.HasSuffix(lowerFilename, ".odt"):
		return "application/vnd.oasis.opendocument.text"
	case strings.HasSuffix(lowerFilename, ".ods"):
		return "application/vnd.oasis.opendocument.spreadsheet"
	case strings.HasSuffix(lowerFilename, ".odp"):
		return "application/vnd.oasis.opendocument.presentation"

	// Other files
	case strings.HasSuffix(lowerFilename, ".rtf"):
		return "application/rtf"
	case strings.HasSuffix(lowerFilename, ".epub"):
		return "application/epub+zip"
	case strings.HasSuffix(lowerFilename, ".apk"):
		return "application/vnd.android.package-archive"
	case strings.HasSuffix(lowerFilename, ".exe"):
		return "application/x-msdownload"
	case strings.HasSuffix(lowerFilename, ".dmg"):
		return "application/x-apple-diskimage"
	case strings.HasSuffix(lowerFilename, ".iso"):
		return "application/x-iso9660-image"

	default:
		return "application/octet-stream"
	}
}
