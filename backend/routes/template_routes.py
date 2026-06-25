from flask import Blueprint, send_file
import pandas as pd

template_bp = Blueprint(
    "template",
    __name__
)

@template_bp.route(
    "/download-template",
    methods=["GET"]
)
def download_template():

    filename = "utility_template.xlsx"

    data_sheet = pd.DataFrame({
        "Utility_ID": ["U1"],
        "Sub_Utility": ["Main Grid Supply"],
        "Timestamp": ["2025-01-01 10:30:00"],
        "Value": [1500.25],
        "Unit": ["kWh"]
    })

    # instruction_sheet = pd.DataFrame({
    #     "Field": [
    #         "Utility_ID",
    #         "Sub_Utility",
    #         "Timestamp",
    #         "Value",
    #         "Unit"
    #     ],
    #     "Description": [
    #         "Unique utility identifier",
    #         "Name of utility",
    #         "Date and time in YYYY-MM-DD HH:MM:SS",
    #         "Consumption value",
    #         "Measurement unit"
    #     ],
    #     "Example": [
    #         "U1",
    #         "Main Grid Supply",
    #         "2025-01-01 10:30:00",
    #         "1500.25",
    #         "kWh, kL, L"
    #     ]
    # })

    mapping_sheet = pd.DataFrame({
        "Utility_ID": [
            "U1","U2","U3",
            "U4","U5","U6","U7"
        ],
        "Resource Type": [
            "Energy","Energy","Energy",
            "Water","Water","Water","Water"
        ],
        "Sub Utility": [
            "Main Grid Supply",
            "Backup Diesel Generator",
            "Solar Panels",
            "Municipal Water Supply",
            "Groundwater Borewell",
            "Process Cooling Water",
            "Wastewater Discharge"
        ],
        "Unit": [
            "kWh","kWh","kWh",
            "kL","kL","kL","kL"
        ]
    })
    
    with pd.ExcelWriter(filename) as writer:
        data_sheet.to_excel(
            writer,
            sheet_name="Data Template",
            index=False
        )

        # instruction_sheet.to_excel(
        #     writer,
        #     sheet_name="Instructions",
        #     index=False
        # )

        mapping_sheet.to_excel(
            writer,
            sheet_name="Instructions",
            index=False
        )

    return send_file(
        filename,
        as_attachment=True
    )