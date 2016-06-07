/// <reference path="./ApplicationInsights.ts" />
declare var angular: angular.IAngularStatic;

var httpRequestService = angular.module("$$ApplicationInsights-HttpRequestModule", []);
httpRequestService.factory("$$applicationInsightsHttpRequestService", () => {
    return ()=> new HttpRequest();
});


// Application Insights Module
var angularAppInsights = angular.module("ApplicationInsightsModule", ["$$ApplicationInsights-HttpRequestModule"]);
var logInterceptor: LogInterceptor;
var exceptionInterceptor: ExceptionInterceptor;
var tools = new Tools(angular);

// setup some features that can only be done during the configure pass
angularAppInsights.config([
    "$provide", $provide => {
        logInterceptor = new LogInterceptor($provide, angular);
        exceptionInterceptor = new ExceptionInterceptor($provide);
    }
]);

angularAppInsights.provider("applicationInsightsService", () => new AppInsightsProvider());

// the run block sets up automatic page view tracking
angularAppInsights.run([
    "$rootScope", "$location", "applicationInsightsService", ($rootScope, $location, applicationInsightsService: ApplicationInsights) => {

        var locationChangeStartOn: number;

        $rootScope.$on("$locationChangeStart", () => {

            if (applicationInsightsService.options.autoPageViewTracking) {
                locationChangeStartOn = (new Date()).getTime();
            }
        });

        $rootScope.$on("$viewContentLoaded", (e, view) => {

            if (applicationInsightsService.options.autoPageViewTracking
                && locationChangeStartOn > 0) {

                var duration = (new Date()).getTime() - locationChangeStartOn;
                var name = applicationInsightsService.options.applicationName + $location.path();

                if (view) {
                    name += "#" + view;
                }

                applicationInsightsService.trackPageView(name, null, null, null, duration);
            }
        });
    }
]);

class AppInsightsProvider implements angular.IServiceProvider {
    // configuration properties for the provider
    private _options = new Options();

    configure(instrumentationKey, applicationName, enableAutoPageViewTracking) {
        if (Tools.isString(applicationName)) {
            this._options.instrumentationKey = instrumentationKey;
            this._options.applicationName = applicationName;
            this._options.autoPageViewTracking = Tools.isNullOrUndefined(enableAutoPageViewTracking) ? true : enableAutoPageViewTracking;
        } else {
            Tools.extend(this._options, applicationName);
            this._options.instrumentationKey = instrumentationKey;
        }
    } // invoked when the provider is run
    $get = ["$locale", "$window", "$location", "$rootScope", "$parse", "$document", "$$applicationInsightsHttpRequestService", ($locale, $window, $location, $rootScope, $parse, $document, $$applicationInsightsHttpRequestService) => {

            // get a reference of storage
            var storage = new AppInsightsStorage({
                window: $window,
                rootScope: $rootScope,
                document: $document,
                parse: $parse
            });

            return new ApplicationInsights(storage, $locale, $window, $location, logInterceptor, exceptionInterceptor, $$applicationInsightsHttpRequestService, this._options);
        }
    ];


}