import requests

def make_get_request(url, params=None, headers=None):
    """
    Makes a generic GET request to the specified URL with optional parameters and headers.

    :param url: The URL to send the GET request to.
    :param params: Optional dictionary of query parameters.
    :param headers: Optional dictionary of headers to send with the request.
    :return: Response object containing the server's response.
    """
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()  # This will raise an exception for HTTP errors
        return response
    except requests.exceptions.RequestException as e:
        print(f" <<<<<<<<<< GET request failed: {e}", end="\n")
        return response

def make_post_request(url, params=None, body=None, headers=None):
    """
    Makes a generic POST request to the specified URL with optional URL parameters, JSON body, and headers.

    :param url: The URL to send the POST request to.
    :param params: Optional dictionary of query parameters.
    :param body: Optional JSON data to send in the request body.
    :param headers: Optional dictionary of headers to send with the request.
    :return: Response object containing the server's response.
    """
    try:
        response = requests.post(url, params=params, json=body, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        return response
    except requests.exceptions.RequestException as e:
        print(f" <<<<<<<<<< POST request failed: {e}", end="\n")
        return response

# Get请求示例用法
if __name__ == "__main__":
    url = "https://api.example.com/data"
    params = {"key": "value", "another_key": "another_value"}
    headers = {
        "Accept": "application/json",
        "Authorization": "Bearer your_token_here"
    }
    
    response = make_get_request(url, params=params, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(" <<<<<<<<<< Received data:\n\t", data, end="\n\n")
    else:
        error_message = response.json()
        print(" <<<<<<<<<< Response error.\n\t", error_message, end="\n\n")

# Post请求示例用法
if __name__ == "__main__":
    url = "https://api.example.com/data"
    params = {"key": "value", "another_key": "another_value"}
    body = {"name": "John", "age": 30}
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer your_token_here"
    }

    response = make_post_request(url, params=params, body=body, headers=headers)

    if response.status_code == 200:
        data = response.json()
        print(" <<<<<<<<<< Received data:\n\t", data, end="\n\n")
    else:
        error_message = response.json()
        print(" <<<<<<<<<< Response error.\n\t", error_message, end="\n\n")
