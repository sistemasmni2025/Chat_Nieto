import traceback
import sqlalchemy
import pandas as pd
import polars as pl
import os
from dotenv import load_dotenv

load_dotenv()
db_uri = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"

try:
    df = pl.read_excel('uploads/Temporal.xlsx')
    
    # Rename blank columns
    new_cols = []
    for i, c in enumerate(df.columns):
        if not c or not str(c).strip():
            new_cols.append(f"col_vacia_{i}")
        else:
            new_cols.append(c)
    df.columns = new_cols

    engine = sqlalchemy.create_engine(db_uri)
    df.to_pandas().to_sql("temp_archivo_usuario", engine, if_exists='replace', index=False)
    print("SUCCESS!")
except Exception as e:
    traceback.print_exc()
