# services/aggregation_service.py

def aggregate_data(df):

    aggregated_df = (

        df.groupby(
            [
                "utility_id",
                "sub_utility",
                "resource_type",
                "date",
                "month",
                "year",
                "unit"
            ],
            as_index=False
        )

        .agg(
            {
                "consumption": "sum"
            }
        )
    )
    return aggregated_df