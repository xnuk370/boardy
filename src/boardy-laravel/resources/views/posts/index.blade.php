@extends('layouts.app')

@section('title', 'Лента постов')

@section('content')
    <h1 class="mb-4">Лента постов</h1>

    <!-- Кирпичик 7: Контейнер с id для WebSocket-обновлений -->
    <div id="posts-feed">
    @forelse ($posts as $post)
        <article class="card mb-3">
            <div class="card-body">
                <h3 class="card-title">
                    <a href="{{ route('posts.show', $post) }}" class="text-decoration-none text-dark">
                        {{ $post->title }}
                    </a>
                </h3>
                <h6 class="card-subtitle mb-2 text-muted">
                    Автор: {{ $post->author->name }} •
                    {{ $post->created_at->format('d.m.Y H:i') }}
                </h6>
                <p class="card-text">{{ Str::limit($post->body, 200) }}</p>
                <a href="{{ route('posts.show', $post) }}" class="btn btn-sm btn-outline-primary">Читать далее</a>
            </div>
        </article>
    @empty
        <div class="alert alert-info">
            Постов пока нет.
        </div>
    @endforelse
    </div>

    <!-- Ссылки пагинации -->
    <div class="d-flex justify-content-center mt-4">
        {{ $posts->links() }}
    </div>
@endsection

<!-- Кирпичик 8: WebSocket-клиент (вставлен напрямую) -->
<script>
const wsUrl = '{{ app()->environment("production") ? "wss://api." . config("app.fastapi_domain") . "/ws" : "ws://localhost:8000/ws" }}';

function connect() {
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => console.log('✅ WS connected');
    ws.onmessage = (e) => {
        try {
            const msg = JSON.parse(e.data);
            if (msg.type === 'new_post') prependPost(msg.post);
        } catch (err) { console.error('WS parse error:', err); }
    };
    ws.onclose = () => setTimeout(connect, 3000);
    ws.onerror = (err) => console.error('WS error:', err);
}

function prependPost(post) {
    const feed = document.getElementById('posts-feed');
    if (!feed) return;
    const el = document.createElement('article');
    el.className = 'card mb-3';
    el.innerHTML = `
        <div class="card-body">
            <h3 class="card-title">
                <a href="/posts/${post.id}" class="text-decoration-none text-dark">
                    ${escapeHtml(post.title)}
                </a>
            </h3>
            <h6 class="card-subtitle mb-2 text-muted">
                Автор: ${escapeHtml(post.author)} •
                ${new Date(post.created_at).toLocaleString('ru-RU', {day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
            </h6>
            <p class="card-text">${escapeHtml(post.body.substring(0,200))}${post.body.length>200?'...':''}</p>
            <a href="/posts/${post.id}" class="btn btn-sm btn-outline-primary">Читать далее</a>
        </div>`;
    feed.prepend(el);
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(() => el.style.opacity = '1', 10);
}

function escapeHtml(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', connect);
</script>
