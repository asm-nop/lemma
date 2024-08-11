FROM debian:12 as build-env

WORKDIR /src

# Install dependencies
RUN apt-get update && \
    apt-get install -y curl build-essential libssl-dev texinfo libcap2-bin pkg-config

# Install rustup
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y

# Copy all the source files
# .dockerignore ignores the target dir
# This includes the rust-toolchain.toml
COPY . .

# Set environment variables
ENV PATH="/root/.cargo/bin:${PATH}"
ENV RUSTUP_HOME="/root/.rustup"
ENV CARGO_HOME="/root/.cargo"

# Install the toolchain
RUN rustup component add cargo

# Build the load-tester
RUN cargo build --package relay --release

# Make sure it runs
RUN /src/target/release/relay --version

# cc variant because we need libgcc and others
FROM gcr.io/distroless/cc-debian12:nonroot

# Copy the load-tester binary
COPY --from=build-env --chown=0:10001 --chmod=010 /src/target/release/relay /bin/relay

ENTRYPOINT [ "/bin/relay" ]
