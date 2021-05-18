FROM openpolicyagent/opa
LABEL author=nicola.vurchio@iad2.it
LABEL sidecar=true
LABEL app=nightswatch

COPY ./policy/bundle /bundles
COPY ./policy/config.yaml /config.yaml
CMD [ "run" ,"--server" ,"--log-format" ,"json","/bundles" ,"--config-file" ,"/config.yaml" ]
