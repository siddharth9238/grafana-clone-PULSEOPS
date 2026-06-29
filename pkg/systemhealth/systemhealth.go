package systemhealth

import (
	"encoding/json"
	"net/http"
)

type Health struct {
	CPU    string `json:"cpu"`
	Memory string `json:"memory"`
	Disk   string `json:"disk"`
	Status string `json:"status"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(Health{
		CPU:    "15%",
		Memory: "42%",
		Disk:   "67%",
		Status: "Running",
	})
}