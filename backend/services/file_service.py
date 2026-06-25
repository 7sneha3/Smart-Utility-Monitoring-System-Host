# services/file_service.py

import pandas as pd


ALLOWED_EXTENSIONS = {
    "csv",
    "xlsx",
    "xls"
}


def allowed_file(filename):

    return (
        "." in filename
        and
        filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )
    
def read_file(filepath):

    if filepath.endswith(".csv"):
        return pd.read_csv(filepath)

    elif filepath.endswith(
        (".xlsx", ".xls")
    ):

        return pd.read_excel(
            filepath,
            sheet_name=0
        )

    return pd.read_excel(filepath)