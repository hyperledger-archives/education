FROM bcgovimages/von-image:py35-1.6-7

ADD --chown=indy:indy indy_config.py /etc/indy/

ADD --chown=indy:indy . $HOME
RUN chmod uga+x scripts/* bin/*

USER indy

RUN mkdir -p \
        $HOME/ledger/sandbox/data \
        $HOME/log \
        $HOME/.indy-cli/networks \
        $HOME/.indy_client/wallet && \
    chmod -R ug+rw $HOME/log $HOME/ledger $HOME/.indy-cli $HOME/.indy_client

ENV RUST_LOG ${RUST_LOG:-warning}