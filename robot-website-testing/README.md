# Robot Framework Website Testing

#### System Requirements
 - Python version 2
 - Packages in requirements.txt file

``` bash
# Install Python Libraries
$ pip install -r requirements.txt

# Run Robot Script
$ pybot -v env:<alpha|staging> -i <"tag name"> <path file .robot> # Run with tag
$ pybot -v env:alpha testcases # Run all TestCases in alpha environment

```
