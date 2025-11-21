public with sharing class NewsAppController {
    @AuraEnabled(cacheable=false)
    public static Map<String, Object> retriveNews(String category, String fromDate, String toDate, String language, String keywords) {

        // Get endpoint + key
        String devName = 'News_App_Integration';
        NewAPIDetails__mdt apiDetails = [
            SELECT Id, Endpoint__c, API_Key__c 
            FROM NewAPIDetails__mdt 
            WHERE DeveloperName = :devName 
            LIMIT 1
        ];

        // Base endpoint (example: https://newsapi.org/v2/everything?)
        String baseURL = apiDetails.Endpoint__c;
        String apiKey = apiDetails.API_Key__c;

        // Default keyword if empty
        if (String.isBlank(keywords)) {
            keywords = 'tech';
        }

        // Build query params
        List<String> params = new List<String>();

        params.add('q=' + EncodingUtil.urlEncode(keywords, 'UTF-8'));

        if (!String.isBlank(category) && category != 'all') {
            params.add('category=' + EncodingUtil.urlEncode(category, 'UTF-8'));
        }
        if (!String.isBlank(fromDate)) {
            params.add('from=' + EncodingUtil.urlEncode(fromDate, 'UTF-8'));
        }
        if (!String.isBlank(toDate)) {
            params.add('to=' + EncodingUtil.urlEncode(toDate, 'UTF-8'));
        }
        if (!String.isBlank(language)) {
            params.add('language=' + EncodingUtil.urlEncode(language, 'UTF-8'));
        }

        // Combine all params
        String fullURL = baseURL + String.join(params, '&') + '&apiKey=' + apiKey;
        System.debug('Final API URL: ' + fullURL);

        // HTTP Callout
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(fullURL);
        request.setMethod('GET');
        request.setTimeout(5000);
        request.setHeader('Content-Type', 'application/json');

        HttpResponse response = http.send(request);

        if (response.getStatusCode() == 200) {
            return (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
        } else {
            System.debug('API Error: ' + response.getBody());
            return new Map<String, Object>{ 'error' => 'Failed to fetch news.' };
        }
    }
}
