FROM debian:12 as build-env

WORKDIR /src

# Install dependencies
RUN apt-get update && \
    apt-get install -y curl build-essential libssl-dev texinfo libcap2-bin pkg-config

# Install rustup
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
ENV RUSTUP_HOME="/root/.rustup"
ENV CARGO_HOME="/root/.cargo"


COPY . .

# Build the load-tester
RUN cargo build --package relay --release

# cc variant because we need libgcc and others
FROM gcr.io/distroless/cc-debian12:nonroot

# Copy the load-tester binary
COPY --from=build-env --chown=0:10001 --chmod=010 /src/target/release/relay /bin/relay


ENTRYPOINT [ "/bin/relay" ]
