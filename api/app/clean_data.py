import pandas as pd
import re
import os

def extract_email_from_sender(sender_value):
    """
    Extract email address from sender field.
    If the value contains '<' and '>', extract the content between them.
    Otherwise, return the original value.
    """
    if pd.isna(sender_value) or sender_value == '':
        return sender_value
    
    sender_str = str(sender_value)
    
    # Check if the sender contains '<' and '>'
    if '<' in sender_str and '>' in sender_str:
        # Extract content between '<' and '>'
        match = re.search(r'<([^>]+)>', sender_str)
        if match:
            return match.group(1).strip()
    
    # If no angle brackets or no match found, return original value
    return sender_str

def clean_sender_data(input_file_path, output_file_path=None):
    """
    Process CSV file to create a new 'sender_email' column from the 'sender' column.
    
    Args:
        input_file_path (str): Path to the input CSV file
        output_file_path (str, optional): Path to save the cleaned CSV file. 
                                        If None, overwrites the original file.
    """
    try:
        # Read the CSV file
        print(f"Reading CSV file: {input_file_path}")
        df = pd.read_csv(input_file_path)
        
        # Check if 'sender' column exists
        if 'sender' not in df.columns:
            print("Error: 'sender' column not found in the CSV file.")
            print(f"Available columns: {list(df.columns)}")
            return
        
        print(f"Original data shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        
        # Create the new 'sender_email' column
        print("Processing sender data...")
        df['sender_email'] = df['sender'].apply(extract_email_from_sender)
        
        # Show some examples of the transformation
        print("\nSample transformations:")
        sample_data = df[['sender', 'sender_email']].head(10)
        for idx, row in sample_data.iterrows():
            if row['sender'] != row['sender_email']:
                print(f"  '{row['sender']}' -> '{row['sender_email']}'")
        
        # Determine output path
        if output_file_path is None:
            output_file_path = input_file_path
        
        # Save the cleaned data
        print(f"\nSaving cleaned data to: {output_file_path}")
        df.to_csv(output_file_path, index=False)
        
        print(f"Successfully processed {len(df)} rows.")
        print(f"New data shape: {df.shape}")
        print(f"New columns: {list(df.columns)}")
        
        return df
        
    except FileNotFoundError:
        print(f"Error: File '{input_file_path}' not found.")
    except Exception as e:
        print(f"Error processing file: {str(e)}")

def main():
    """
    Main function to process the CSV files.
    """
    # Define the dataset directory
    dataset_dir = "/Users/qizhao/Documents/PhD/Github/UMBC-hackathon/datasets"
    
    # Process Nazario.csv (which has the 'sender' column)
    nazario_file = os.path.join(dataset_dir, "Nazario.csv")
    
    if os.path.exists(nazario_file):
        print("=" * 60)
        print("Processing Nazario.csv")
        print("=" * 60)
        clean_sender_data(nazario_file)
    else:
        print(f"File not found: {nazario_file}")
    
    # You can also process other files if they have a 'sender' column
    # ling_file = os.path.join(dataset_dir, "Ling.csv")
    # if os.path.exists(ling_file):
    #     print("\n" + "=" * 60)
    #     print("Processing Ling.csv")
    #     print("=" * 60)
    #     clean_sender_data(ling_file)

if __name__ == "__main__":
    main()
